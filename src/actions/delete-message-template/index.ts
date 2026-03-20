"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { whatsappMessageTemplatesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteMessageTemplate = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    await db
      .delete(whatsappMessageTemplatesTable)
      .where(
        and(
          eq(whatsappMessageTemplatesTable.id, parsedInput.id),
          eq(whatsappMessageTemplatesTable.clinicId, ctx.user.clinic.id),
        ),
      );
    revalidatePath("/whatsapp");
  });
