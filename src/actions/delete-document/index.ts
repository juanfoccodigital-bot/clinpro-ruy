"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { documentsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteDocument = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const document = await db.query.documentsTable.findFirst({
      where: eq(documentsTable.id, parsedInput.id),
    });
    if (!document) {
      throw new Error("Documento não encontrado");
    }
    if (document.clinicId !== ctx.user.clinic.id) {
      throw new Error("Documento não encontrado");
    }
    await db
      .delete(documentsTable)
      .where(eq(documentsTable.id, parsedInput.id));
    revalidatePath("/documents");
  });
