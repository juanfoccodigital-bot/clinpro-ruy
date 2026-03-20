"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { whatsappContactsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteWhatsappContact = protectedWithClinicActionClient
  .schema(
    z.object({
      contactId: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    await db
      .delete(whatsappContactsTable)
      .where(
        and(
          eq(whatsappContactsTable.id, parsedInput.contactId),
          eq(whatsappContactsTable.clinicId, ctx.user.clinic.id),
        ),
      );

    revalidatePath("/whatsapp/contatos");
    return { success: true };
  });
