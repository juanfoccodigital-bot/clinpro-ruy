"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { whatsappContactsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const updateWhatsappContact = protectedWithClinicActionClient
  .schema(
    z.object({
      contactId: z.string().uuid(),
      name: z.string().min(1).optional(),
      phoneNumber: z.string().min(1).optional(),
      email: z.string().email().optional().nullable(),
      notes: z.string().optional().nullable(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { contactId, ...data } = parsedInput;

    await db
      .update(whatsappContactsTable)
      .set(data)
      .where(
        and(
          eq(whatsappContactsTable.id, contactId),
          eq(whatsappContactsTable.clinicId, ctx.user.clinic.id),
        ),
      );

    revalidatePath("/whatsapp/contatos");
    return { success: true };
  });
