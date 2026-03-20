"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { getRequestInfo, logAuditEvent } from "@/lib/audit-logger";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteAppointment = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const appointment = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, parsedInput.id),
    });
    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }
    if (appointment.clinicId !== ctx.user.clinic.id) {
      throw new Error("Agendamento não encontrado");
    }
    await db
      .delete(appointmentsTable)
      .where(eq(appointmentsTable.id, parsedInput.id));
    const { ipAddress, userAgent } = await getRequestInfo();
    await logAuditEvent({
      clinicId: ctx.user.clinic.id,
      userId: ctx.user.id,
      action: "delete",
      module: "appointments",
      resourceId: parsedInput.id,
      resourceType: "appointment",
      description: "Agendamento excluido",
      ipAddress,
      userAgent,
    });
    revalidatePath("/appointments");
  });
