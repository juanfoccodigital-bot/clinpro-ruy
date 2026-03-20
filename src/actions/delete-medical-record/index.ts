"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { medicalRecordsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteMedicalRecord = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const record = await db.query.medicalRecordsTable.findFirst({
      where: eq(medicalRecordsTable.id, parsedInput.id),
    });
    if (!record) {
      throw new Error("Registro clínico não encontrado");
    }
    if (record.clinicId !== ctx.user.clinic.id) {
      throw new Error("Registro clínico não encontrado");
    }
    await db
      .delete(medicalRecordsTable)
      .where(eq(medicalRecordsTable.id, parsedInput.id));
    revalidatePath("/patients");
  });
