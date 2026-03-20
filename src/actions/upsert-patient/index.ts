"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { getRequestInfo, logAuditEvent } from "@/lib/audit-logger";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertPatientSchema } from "./schema";

export const upsertPatient = protectedWithClinicActionClient
  .schema(upsertPatientSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .insert(patientsTable)
      .values({
        ...parsedInput,
        id: parsedInput.id,
        clinicId: ctx.user.clinic.id,
      })
      .onConflictDoUpdate({
        target: [patientsTable.id],
        set: {
          ...parsedInput,
        },
      });
    const isUpdate = !!parsedInput.id;
    const { ipAddress, userAgent } = await getRequestInfo();
    await logAuditEvent({
      clinicId: ctx.user.clinic.id,
      userId: ctx.user.id,
      action: isUpdate ? "update" : "create",
      module: "patients",
      resourceId: parsedInput.id,
      resourceType: "patient",
      description: isUpdate
        ? "Paciente atualizado"
        : "Paciente criado",
      ipAddress,
      userAgent,
    });
    revalidatePath("/patients");
  });
