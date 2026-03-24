"use server";

import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { whatsappConnectionsTable, whatsappConversationsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getWhatsappStatus(): Promise<
  "connected" | "disconnected" | null
> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.clinic?.id) return null;

  const connections = await db.query.whatsappConnectionsTable.findMany({
    where: eq(whatsappConnectionsTable.clinicId, session.user.clinic.id),
  });

  if (connections.length === 0) return null;

  const hasConnected = connections.some((c) => c.status === "connected");
  return hasConnected ? "connected" : "disconnected";
}

export async function getWhatsappUnreadCount(): Promise<number> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.clinic?.id) return 0;

  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(${whatsappConversationsTable.unreadCount}), 0)`,
    })
    .from(whatsappConversationsTable)
    .where(
      and(
        eq(whatsappConversationsTable.clinicId, session.user.clinic.id),
        eq(whatsappConversationsTable.isRead, false),
      ),
    );

  return Number(result[0]?.total ?? 0);
}
