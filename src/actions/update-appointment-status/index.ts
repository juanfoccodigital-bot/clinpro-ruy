"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { updateAppointmentStatusSchema } from "./schema";

export const updateAppointmentStatus = protectedWithClinicActionClient
  .schema(updateAppointmentStatusSchema)
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
      .update(appointmentsTable)
      .set({ status: parsedInput.status })
      .where(eq(appointmentsTable.id, parsedInput.id));
    revalidatePath("/appointments");
    revalidatePath("/dashboard");
  });
