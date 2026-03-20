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
      doctorId: parsedInput.doctorId ?? "",
      appointmentPriceInCents: parsedInput.appointmentPriceInCents,
      clinicId: ctx.user.clinic.id,
      date: appointmentDateTime,
    });

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
  });
