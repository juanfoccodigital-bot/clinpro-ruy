"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { documentTemplatesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertDocumentTemplateSchema } from "./schema";

export const upsertDocumentTemplate = protectedWithClinicActionClient
  .schema(upsertDocumentTemplateSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .insert(documentTemplatesTable)
      .values({
        ...parsedInput,
        clinicId: ctx.user.clinic.id,
      })
      .onConflictDoUpdate({
        target: [documentTemplatesTable.id],
        set: {
          ...parsedInput,
          clinicId: ctx.user.clinic.id,
        },
      });
    revalidatePath("/documents");
  });
