import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  aiAgentConfigTable,
  aiConversationsTable,
  aiMessagesTable,
} from "@/db/schema";

interface GetAiAgentConfigParams {
  clinicId: string;
}

export const getAiAgentConfig = async ({
  clinicId,
}: GetAiAgentConfigParams) => {
  return db.query.aiAgentConfigTable.findFirst({
    where: eq(aiAgentConfigTable.clinicId, clinicId),
  });
};

interface GetAiConversationsParams {
  clinicId: string;
}

export const getAiConversations = async ({
  clinicId,
}: GetAiConversationsParams) => {
  return db.query.aiConversationsTable.findMany({
    where: eq(aiConversationsTable.clinicId, clinicId),
    with: {
      patient: true,
      messages: {
        orderBy: [desc(aiMessagesTable.createdAt)],
        limit: 1,
      },
    },
    orderBy: [desc(aiConversationsTable.updatedAt)],
  });
};

interface GetAiConversationParams {
  clinicId: string;
  conversationId: string;
}

export const getAiConversation = async ({
  clinicId,
  conversationId,
}: GetAiConversationParams) => {
  return db.query.aiConversationsTable.findFirst({
    where: and(
      eq(aiConversationsTable.id, conversationId),
      eq(aiConversationsTable.clinicId, clinicId),
    ),
    with: {
      patient: true,
      messages: {
        orderBy: [aiMessagesTable.createdAt],
      },
    },
  });
};

interface GetAiMetricsParams {
  clinicId: string;
}

export const getAiMetrics = async ({ clinicId }: GetAiMetricsParams) => {
  const totalConversations = await db
    .select({ count: sql<number>`count(*)` })
    .from(aiConversationsTable)
    .where(eq(aiConversationsTable.clinicId, clinicId));

  const resolvedConversations = await db
    .select({ count: sql<number>`count(*)` })
    .from(aiConversationsTable)
    .where(
      and(
        eq(aiConversationsTable.clinicId, clinicId),
        eq(aiConversationsTable.status, "resolved"),
      ),
    );

  const totalMessages = await db
    .select({ count: sql<number>`count(*)` })
    .from(aiMessagesTable)
    .where(eq(aiMessagesTable.clinicId, clinicId));

  const totalTokens = await db
    .select({
      total: sql<number>`coalesce(sum(${aiMessagesTable.tokensUsed}), 0)`,
    })
    .from(aiMessagesTable)
    .where(eq(aiMessagesTable.clinicId, clinicId));

  return {
    totalConversations: Number(totalConversations[0]?.count ?? 0),
    resolvedConversations: Number(resolvedConversations[0]?.count ?? 0),
    totalMessages: Number(totalMessages[0]?.count ?? 0),
    totalTokens: Number(totalTokens[0]?.total ?? 0),
  };
};
