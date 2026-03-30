"use server";

import { and, desc, eq } from "drizzle-orm";
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
    const clinicId = ctx.user.clinic.id;
    const { connectionId, remotePhone } = parsedInput;

    // Fetch last 100 messages + mark as read in parallel
    const messagesPromise = db.query.whatsappMessagesTable.findMany({
      where: and(
        eq(whatsappMessagesTable.clinicId, clinicId),
        eq(whatsappMessagesTable.connectionId, connectionId),
        eq(whatsappMessagesTable.remotePhone, remotePhone),
      ),
      orderBy: [desc(whatsappMessagesTable.createdAt)],
      limit: 100,
    });

    // Mark as read (don't await - fire and forget)
    db.update(whatsappConversationsTable)
      .set({ isRead: true, unreadCount: 0 })
      .where(
        and(
          eq(whatsappConversationsTable.clinicId, clinicId),
          eq(whatsappConversationsTable.connectionId, connectionId),
          eq(whatsappConversationsTable.remotePhone, remotePhone),
        ),
      ).then(() => {});

    const messages = await messagesPromise;

    // Reverse to get chronological order (oldest first)
    return messages.reverse().map((m) => ({
      id: m.id,
      direction: m.direction,
      messageType: m.messageType,
      content: m.content,
      mediaUrl: m.mediaUrl,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
      sentByUserName: null,
    }));
  });
