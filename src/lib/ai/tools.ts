import { and, eq, gte, lte } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

export async function lookupPatient(clinicId: string, phoneNumber: string) {
  return db.query.patientsTable.findFirst({
    where: and(
      eq(patientsTable.clinicId, clinicId),
      eq(patientsTable.phoneNumber, phoneNumber),
    ),
  });
}

export async function checkDoctorAvailability(
  clinicId: string,
  doctorId: string,
  date: string,
) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const doctor = await db.query.doctorsTable.findFirst({
    where: and(
      eq(doctorsTable.id, doctorId),
      eq(doctorsTable.clinicId, clinicId),
    ),
  });

  if (!doctor) return null;

  const existingAppointments = await db.query.appointmentsTable.findMany({
    where: and(
      eq(appointmentsTable.clinicId, clinicId),
      eq(appointmentsTable.doctorId, doctorId),
      gte(appointmentsTable.date, startOfDay),
      lte(appointmentsTable.date, endOfDay),
    ),
  });

  return {
    doctor,
    existingAppointments,
    availableFrom: doctor.availableFromTime,
    availableTo: doctor.availableToTime,
  };
}

export async function listDoctors(clinicId: string) {
  return db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, clinicId),
  });
}
