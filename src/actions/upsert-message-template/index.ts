"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { whatsappMessageTemplatesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const upsertMessageTemplate = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().trim().min(1, "Nome e obrigatorio."),
      content: z.string().trim().min(1, "Conteudo e obrigatorio."),
      category: z.string().trim().optional(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    if (parsedInput.id) {
      await db
        .update(whatsappMessageTemplatesTable)
        .set({
          name: parsedInput.name,
          content: parsedInput.content,
          category: parsedInput.category || null,
        })
        .where(
          and(
            eq(whatsappMessageTemplatesTable.id, parsedInput.id),
            eq(whatsappMessageTemplatesTable.clinicId, ctx.user.clinic.id),
          ),
        );
    } else {
      await db.insert(whatsappMessageTemplatesTable).values({
        clinicId: ctx.user.clinic.id,
        name: parsedInput.name,
        content: parsedInput.content,
        category: parsedInput.category || null,
      });
    }
    revalidatePath("/whatsapp");
  });
