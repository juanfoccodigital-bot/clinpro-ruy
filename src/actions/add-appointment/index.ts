"use server";

import dayjs from "dayjs";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { getRequestInfo, logAuditEvent } from "@/lib/audit-logger";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { getAvailableTimes } from "../get-available-times";
import { addAppointmentSchema } from "./schema";

export const addAppointment = protectedWithClinicActionClient
  .schema(addAppointmentSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (parsedInput.doctorId) {
      const availableTimes = await getAvailableTimes({
        doctorId: parsedInput.doctorId,
        date: dayjs(parsedInput.date).format("YYYY-MM-DD"),
      });
      if (!availableTimes?.data) {
        throw new Error("No available times");
      }
      const isTimeAvailable = availableTimes.data?.some(
        (time) => time.value === parsedInput.time && time.available,
      );
      if (!isTimeAvailable) {
        throw new Error("Time not available");
      }
    }
    const appointmentDateTime = dayjs(parsedInput.date)
      .set("hour", parseInt(parsedInput.time.split(":")[0]))
      .set("minute", parseInt(parsedInput.time.split(":")[1]))
      .toDate();

    await db.insert(appointmentsTable).values({
      patientId: parsedInput.patientId,
      appointmentPriceInCents: parsedInput.appointmentPriceInCents,
      clinicId: ctx.user.clinic.id,
      date: appointmentDateTime,
      procedureId: parsedInput.procedureId || null,
      notes: parsedInput.notes || null,
    });

    // Auto-move patient to "Agendado" stage in CRM
    try {
      const { crmPipelineStagesTable, crmContactStagesTable } = await import("@/db/schema");
      const { and, eq, ilike } = await import("drizzle-orm");

      // Find "Agendado" stage for this clinic
      const agendadoStage = await db.query.crmPipelineStagesTable.findFirst({
        where: and(
          eq(crmPipelineStagesTable.clinicId, ctx.user.clinic.id),
          ilike(crmPipelineStagesTable.name, '%agendado%'),
        ),
      });

      if (agendadoStage) {
        // Check if patient has a stage
        const existingStage = await db.query.crmContactStagesTable.findFirst({
          where: and(
            eq(crmContactStagesTable.patientId, parsedInput.patientId),
            eq(crmContactStagesTable.clinicId, ctx.user.clinic.id),
          ),
        });

        if (existingStage) {
          // Don't move if already in Agendado or Concluído
          const currentStage = await db.query.crmPipelineStagesTable.findFirst({
            where: eq(crmPipelineStagesTable.id, existingStage.stageId),
          });
          if (currentStage && !currentStage.name.toLowerCase().includes('agendado') && !currentStage.name.toLowerCase().includes('conclu')) {
            await db.update(crmContactStagesTable)
              .set({ stageId: agendadoStage.id })
              .where(eq(crmContactStagesTable.id, existingStage.id));
          }
        } else {
          // Create stage entry
          await db.insert(crmContactStagesTable).values({
            clinicId: ctx.user.clinic.id,
            patientId: parsedInput.patientId,
            stageId: agendadoStage.id,
          });
        }
      }
    } catch {
      // Don't fail appointment creation if CRM update fails
    }

    const { ipAddress, userAgent } = await getRequestInfo();
    await logAuditEvent({
      clinicId: ctx.user.clinic.id,
      userId: ctx.user.id,
      action: "create",
      module: "appointments",
      resourceId: parsedInput.patientId,
      resourceType: "appointment",
      description: "Agendamento criado",
      ipAddress,
      userAgent,
    });
    revalidatePath("/appointments");
    revalidatePath("/dashboard");
    revalidatePath("/crm");
  });
