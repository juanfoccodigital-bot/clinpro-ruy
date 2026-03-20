"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { whatsappLabelsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteWhatsappLabel = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    await db
      .delete(whatsappLabelsTable)
      .where(
        and(
          eq(whatsappLabelsTable.id, parsedInput.id),
          eq(whatsappLabelsTable.clinicId, ctx.user.clinic.id),
        ),
      );
    revalidatePath("/whatsapp");
  });
