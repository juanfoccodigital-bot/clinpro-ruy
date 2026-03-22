"use server";

import dayjs from "dayjs";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

// Generate time slots from 08:00 to 20:00 every 30 min
function generateClinicTimeSlots() {
  const slots: string[] = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      slots.push(
        `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`,
      );
    }
  }
  return slots;
}

export const getAvailableTimes = protectedWithClinicActionClient
  .schema(
    z.object({
      doctorId: z.string().optional(),
      date: z.string(), // YYYY-MM-DD
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const selectedDate = parsedInput.date;
    const selectedDayOfWeek = dayjs(selectedDate).day();

    // Block Sundays (day 0)
    if (selectedDayOfWeek === 0) {
      return [];
    }

    // Get all appointments for this date in this clinic
    const allAppointments = await db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.clinicId, ctx.user.clinic.id),
    });

    const appointmentsOnDate = allAppointments
      .filter((a) => dayjs(a.date).isSame(selectedDate, "day"))
      .map((a) => dayjs(a.date).format("HH:mm:ss"));

    const timeSlots = generateClinicTimeSlots();

    return timeSlots.map((time) => ({
      value: time,
      available: !appointmentsOnDate.includes(time),
      label: time.substring(0, 5),
    }));
  });
