"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { documentsTable } from "@/db/schema";
import { getRequestInfo, logAuditEvent } from "@/lib/audit-logger";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertDocumentSchema } from "./schema";

export const upsertDocument = protectedWithClinicActionClient
  .schema(upsertDocumentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { doctorId, ...rest } = parsedInput;
    const values = {
      ...rest,
      doctorId: doctorId ?? "",
      clinicId: ctx.user.clinic.id,
    };
    await db
      .insert(documentsTable)
      .values(values)
      .onConflictDoUpdate({
        target: [documentsTable.id],
        set: values,
      });
    const isUpdate = !!parsedInput.id;
    const { ipAddress, userAgent } = await getRequestInfo();
    await logAuditEvent({
      clinicId: ctx.user.clinic.id,
      userId: ctx.user.id,
      action: isUpdate ? "update" : "create",
      module: "documents",
      resourceId: parsedInput.id,
      resourceType: "document",
      description: isUpdate
        ? "Documento atualizado"
        : "Documento criado",
      ipAddress,
      userAgent,
    });
    revalidatePath("/documents");
  });
