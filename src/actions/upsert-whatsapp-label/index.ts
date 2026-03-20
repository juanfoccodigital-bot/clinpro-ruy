"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { whatsappLabelsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const upsertWhatsappLabel = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().trim().min(1, "Nome e obrigatorio."),
      color: z.string().trim().min(1, "Cor e obrigatoria."),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    if (parsedInput.id) {
      await db
        .update(whatsappLabelsTable)
        .set({ name: parsedInput.name, color: parsedInput.color })
        .where(
          and(
            eq(whatsappLabelsTable.id, parsedInput.id),
            eq(whatsappLabelsTable.clinicId, ctx.user.clinic.id),
          ),
        );
    } else {
      await db.insert(whatsappLabelsTable).values({
        clinicId: ctx.user.clinic.id,
        name: parsedInput.name,
        color: parsedInput.color,
      });
    }
    revalidatePath("/whatsapp");
  });
