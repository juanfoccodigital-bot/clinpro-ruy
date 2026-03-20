"use server";

import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { whatsappConversationsTable, whatsappMessagesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const fetchWhatsappMessages = protectedWithClinicActionClient
  .schema(
    z.object({
      connectionId: z.string().uuid(),
      remotePhone: z.string(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const messages = await db.query.whatsappMessagesTable.findMany({
      where: and(
        eq(whatsappMessagesTable.clinicId, ctx.user.clinic.id),
        eq(whatsappMessagesTable.connectionId, parsedInput.connectionId),
        eq(whatsappMessagesTable.remotePhone, parsedInput.remotePhone),
      ),
      orderBy: [asc(whatsappMessagesTable.createdAt)],
      with: {
        sentByUser: true,
      },
    });

    // Mark conversation as read
    await db
      .update(whatsappConversationsTable)
      .set({ isRead: true, unreadCount: 0 })
      .where(
        and(
          eq(whatsappConversationsTable.clinicId, ctx.user.clinic.id),
          eq(whatsappConversationsTable.connectionId, parsedInput.connectionId),
          eq(whatsappConversationsTable.remotePhone, parsedInput.remotePhone),
        ),
      );

    return messages.map((m) => ({
      id: m.id,
      direction: m.direction,
      messageType: m.messageType,
      content: m.content,
      mediaUrl: m.mediaUrl,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
      sentByUserName: m.sentByUser?.name || null,
    }));
  });
