"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { quickRepliesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteQuickReply = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const quickReply = await db.query.quickRepliesTable.findFirst({
      where: eq(quickRepliesTable.id, parsedInput.id),
    });
    if (!quickReply) {
      throw new Error("Resposta rápida não encontrada");
    }
    if (quickReply.clinicId !== ctx.user.clinic.id) {
      throw new Error("Resposta rápida não encontrada");
    }
    await db
      .delete(quickRepliesTable)
      .where(eq(quickRepliesTable.id, parsedInput.id));
    revalidatePath("/whatsapp");
  });
