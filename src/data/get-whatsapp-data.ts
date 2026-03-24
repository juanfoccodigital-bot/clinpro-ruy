import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  quickRepliesTable,
  whatsappConnectionsTable,
  whatsappContactsTable,
  whatsappConversationsTable,
  whatsappLabelsTable,
  whatsappMessageTemplatesTable,
} from "@/db/schema";

interface GetWhatsappConnectionsParams {
  clinicId: string;
}

export const getWhatsappConnections = async ({
  clinicId,
}: GetWhatsappConnectionsParams) => {
  return db.query.whatsappConnectionsTable.findMany({
    where: eq(whatsappConnectionsTable.clinicId, clinicId),
    orderBy: [desc(whatsappConnectionsTable.createdAt)],
  });
};

interface GetWhatsappConnectionParams {
  clinicId: string;
  connectionId: string;
}

export const getWhatsappConnection = async ({
  clinicId,
  connectionId,
}: GetWhatsappConnectionParams) => {
  return db.query.whatsappConnectionsTable.findFirst({
    where: and(
      eq(whatsappConnectionsTable.id, connectionId),
      eq(whatsappConnectionsTable.clinicId, clinicId),
    ),
  });
};

interface GetConversationsParams {
  clinicId: string;
  connectionId: string;
}

export const getConversations = async ({
  clinicId,
  connectionId,
}: GetConversationsParams) => {
  return db.query.whatsappConversationsTable.findMany({
    where: and(
      eq(whatsappConversationsTable.clinicId, clinicId),
      eq(whatsappConversationsTable.connectionId, connectionId),
    ),
    with: {
      contact: {
        with: {
          patient: {
            with: {
              crmContactStage: {
                with: {
                  stage: true,
                },
              },
            },
          },
        },
      },
      labels: {
        with: {
          label: true,
        },
      },
      assignedTo: true,
    },
    orderBy: [desc(whatsappConversationsTable.lastMessageAt)],
  });
};

interface GetQuickRepliesParams {
  clinicId: string;
}

export const getQuickReplies = async ({
  clinicId,
}: GetQuickRepliesParams) => {
  return db.query.quickRepliesTable.findMany({
    where: eq(quickRepliesTable.clinicId, clinicId),
    orderBy: [quickRepliesTable.shortcut],
  });
};

interface GetWhatsappLabelsParams {
  clinicId: string;
}

export const getWhatsappLabels = async ({
  clinicId,
}: GetWhatsappLabelsParams) => {
  return db.query.whatsappLabelsTable.findMany({
    where: eq(whatsappLabelsTable.clinicId, clinicId),
    orderBy: [whatsappLabelsTable.name],
  });
};

interface GetMessageTemplatesParams {
  clinicId: string;
}

export const getMessageTemplates = async ({
  clinicId,
}: GetMessageTemplatesParams) => {
  return db.query.whatsappMessageTemplatesTable.findMany({
    where: eq(whatsappMessageTemplatesTable.clinicId, clinicId),
    orderBy: [whatsappMessageTemplatesTable.name],
  });
};

interface GetWhatsappContactsParams {
  clinicId: string;
}

export const getWhatsappContacts = async ({
  clinicId,
}: GetWhatsappContactsParams) => {
  return db.query.whatsappContactsTable.findMany({
    where: eq(whatsappContactsTable.clinicId, clinicId),
    with: {
      patient: true,
    },
    orderBy: [desc(whatsappContactsTable.createdAt)],
  });
};
