"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { getRequestInfo, logAuditEvent } from "@/lib/audit-logger";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteDoctor = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, parsedInput.id),
    });
    if (!doctor) {
      throw new Error("Profissional não encontrado");
    }
    if (doctor.clinicId !== ctx.user.clinic.id) {
      throw new Error("Profissional não encontrado");
    }
    await db.delete(doctorsTable).where(eq(doctorsTable.id, parsedInput.id));
    const { ipAddress, userAgent } = await getRequestInfo();
    await logAuditEvent({
      clinicId: ctx.user.clinic.id,
      userId: ctx.user.id,
      action: "delete",
      module: "doctors",
      resourceId: parsedInput.id,
      resourceType: "doctor",
      description: "Profissional excluido",
      ipAddress,
      userAgent,
    });
    revalidatePath("/doctors");
  });
