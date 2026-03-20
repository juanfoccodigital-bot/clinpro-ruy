"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { consentTermsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteConsentTerm = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const consentTerm = await db.query.consentTermsTable.findFirst({
      where: eq(consentTermsTable.id, parsedInput.id),
    });
    if (!consentTerm) {
      throw new Error("Termo de consentimento não encontrado");
    }
    if (consentTerm.clinicId !== ctx.user.clinic.id) {
      throw new Error("Termo de consentimento não encontrado");
    }
    await db
      .delete(consentTermsTable)
      .where(eq(consentTermsTable.id, parsedInput.id));
    revalidatePath("/configuracoes/lgpd");
  });
