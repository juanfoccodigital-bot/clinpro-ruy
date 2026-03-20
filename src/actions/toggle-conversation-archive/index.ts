"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { whatsappConversationsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const toggleConversationArchive = protectedWithClinicActionClient
  .schema(
    z.object({
      conversationId: z.string().uuid(),
      isArchived: z.boolean(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    await db
      .update(whatsappConversationsTable)
      .set({ isArchived: parsedInput.isArchived })
      .where(
        and(
          eq(whatsappConversationsTable.id, parsedInput.conversationId),
          eq(whatsappConversationsTable.clinicId, ctx.user.clinic.id),
        ),
      );
    revalidatePath("/whatsapp");
  });
