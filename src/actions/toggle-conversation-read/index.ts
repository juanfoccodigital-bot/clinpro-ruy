"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { whatsappConversationsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const toggleConversationRead = protectedWithClinicActionClient
  .schema(
    z.object({
      conversationId: z.string().uuid(),
      isRead: z.boolean(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    await db
      .update(whatsappConversationsTable)
      .set({
        isRead: parsedInput.isRead,
        unreadCount: parsedInput.isRead ? 0 : 1,
      })
      .where(
        and(
          eq(whatsappConversationsTable.id, parsedInput.conversationId),
          eq(whatsappConversationsTable.clinicId, ctx.user.clinic.id),
        ),
      );
    revalidatePath("/whatsapp");
  });
