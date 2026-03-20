"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { consentTermsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertConsentTermSchema } from "./schema";

export const upsertConsentTerm = protectedWithClinicActionClient
  .schema(upsertConsentTermSchema)
  .action(async ({ parsedInput, ctx }) => {
    const values = {
      ...parsedInput,
      clinicId: ctx.user.clinic.id,
      acceptedAt: parsedInput.accepted ? new Date() : null,
      revokedAt: parsedInput.accepted ? null : new Date(),
    };

    await db
      .insert(consentTermsTable)
      .values(values)
      .onConflictDoUpdate({
        target: [consentTermsTable.id],
        set: {
          ...parsedInput,
          clinicId: ctx.user.clinic.id,
          acceptedAt: parsedInput.accepted ? new Date() : null,
          revokedAt: parsedInput.accepted ? null : new Date(),
        },
      });
    revalidatePath("/configuracoes/lgpd");
  });
