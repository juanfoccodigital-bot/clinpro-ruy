"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { medicalRecordsTable } from "@/db/schema";
import { getRequestInfo, logAuditEvent } from "@/lib/audit-logger";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertMedicalRecordSchema } from "./schema";

export const upsertMedicalRecord = protectedWithClinicActionClient
  .schema(upsertMedicalRecordSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { doctorId, ...rest } = parsedInput;
    const values = {
      ...rest,
      doctorId: doctorId ?? "",
      clinicId: ctx.user.clinic.id,
    };
    await db
      .insert(medicalRecordsTable)
      .values(values)
      .onConflictDoUpdate({
        target: [medicalRecordsTable.id],
        set: values,
      });
    const isUpdate = !!parsedInput.id;
    const { ipAddress, userAgent } = await getRequestInfo();
    await logAuditEvent({
      clinicId: ctx.user.clinic.id,
      userId: ctx.user.id,
      action: isUpdate ? "update" : "create",
      module: "medical_records",
      resourceId: parsedInput.id,
      resourceType: "medical_record",
      description: isUpdate
        ? "Prontuario atualizado"
        : "Prontuario criado",
      ipAddress,
      userAgent,
    });
    revalidatePath("/patients");
  });
