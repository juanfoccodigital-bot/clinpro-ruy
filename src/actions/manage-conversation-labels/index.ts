"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import {
  whatsappConversationLabelsTable,
  whatsappConversationsTable,
} from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const addConversationLabel = protectedWithClinicActionClient
  .schema(
    z.object({
      conversationId: z.string().uuid(),
      labelId: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    // Verify conversation belongs to clinic
    const conversation = await db.query.whatsappConversationsTable.findFirst({
      where: and(
        eq(whatsappConversationsTable.id, parsedInput.conversationId),
        eq(whatsappConversationsTable.clinicId, ctx.user.clinic.id),
      ),
    });
    if (!conversation) throw new Error("Conversa nao encontrada.");

    // Check if label already assigned
    const existing =
      await db.query.whatsappConversationLabelsTable.findFirst({
        where: and(
          eq(
            whatsappConversationLabelsTable.conversationId,
            parsedInput.conversationId,
          ),
          eq(whatsappConversationLabelsTable.labelId, parsedInput.labelId),
        ),
      });

    if (!existing) {
      await db.insert(whatsappConversationLabelsTable).values({
        conversationId: parsedInput.conversationId,
        labelId: parsedInput.labelId,
      });
    }
    revalidatePath("/whatsapp");
  });

export const removeConversationLabel = protectedWithClinicActionClient
  .schema(
    z.object({
      conversationId: z.string().uuid(),
      labelId: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const conversation = await db.query.whatsappConversationsTable.findFirst({
      where: and(
        eq(whatsappConversationsTable.id, parsedInput.conversationId),
        eq(whatsappConversationsTable.clinicId, ctx.user.clinic.id),
      ),
    });
    if (!conversation) throw new Error("Conversa nao encontrada.");

    await db
      .delete(whatsappConversationLabelsTable)
      .where(
        and(
          eq(
            whatsappConversationLabelsTable.conversationId,
            parsedInput.conversationId,
          ),
          eq(whatsappConversationLabelsTable.labelId, parsedInput.labelId),
        ),
      );
    revalidatePath("/whatsapp");
  });
