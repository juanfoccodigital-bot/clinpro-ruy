"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { documentTemplatesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteDocumentTemplate = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const template = await db.query.documentTemplatesTable.findFirst({
      where: eq(documentTemplatesTable.id, parsedInput.id),
    });
    if (!template) {
      throw new Error("Template não encontrado");
    }
    if (template.clinicId !== ctx.user.clinic.id) {
      throw new Error("Template não encontrado");
    }
    await db
      .delete(documentTemplatesTable)
      .where(eq(documentTemplatesTable.id, parsedInput.id));
    revalidatePath("/documents");
  });
