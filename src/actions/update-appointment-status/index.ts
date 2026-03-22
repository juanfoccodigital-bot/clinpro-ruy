"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable, financialTransactionsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { deductProcedureStock } from "../procedures";
import { updateAppointmentStatusSchema } from "./schema";

export const updateAppointmentStatus = protectedWithClinicActionClient
  .schema(updateAppointmentStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    const appointment = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, parsedInput.id),
      with: {
        patient: true,
      },
    });
    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }
    if (appointment.clinicId !== ctx.user.clinic.id) {
      throw new Error("Agendamento não encontrado");
    }
    await db
      .update(appointmentsTable)
      .set({ status: parsedInput.status })
      .where(eq(appointmentsTable.id, parsedInput.id));

    // When appointment is completed, deduct stock and create financial transaction
    if (parsedInput.status === "completed") {
      // Deduct stock if procedure is linked
      if (appointment.procedureId) {
        try {
          await deductProcedureStock(
            appointment.procedureId,
            ctx.user.clinic.id,
          );
        } catch (error) {
          console.error(
            `Erro ao deduzir estoque para procedimento ${appointment.procedureId} (agendamento ${appointment.id}):`,
            error instanceof Error ? error.message : error,
          );
        }
      } else {
        console.warn(
          `Agendamento ${appointment.id} concluído sem procedimento vinculado. Estoque não deduzido.`,
        );
      }

      // Create income financial transaction
      if (appointment.appointmentPriceInCents > 0) {
        await db.insert(financialTransactionsTable).values({
          clinicId: ctx.user.clinic.id,
          type: "income",
          category: "procedure",
          description: `Atendimento - ${appointment.patient?.name ?? "Paciente"}`,
          amountInCents: appointment.appointmentPriceInCents,
          status: "paid",
          paymentDate: new Date(),
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          procedureId: appointment.procedureId,
        });
      }
    }

    revalidatePath("/appointments");
    revalidatePath("/dashboard");
    revalidatePath("/financeiro");
    revalidatePath("/estoque");
  });
