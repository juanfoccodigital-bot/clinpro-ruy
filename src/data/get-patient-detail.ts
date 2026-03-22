import { and, desc, eq, gte } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentsTable,
  medicalAttachmentsTable,
  medicalRecordsTable,
  patientsTable,
  vitalsTable,
} from "@/db/schema";

interface GetPatientDetailParams {
  patientId: string;
  clinicId: string;
}

export const getPatientDetail = async ({
  patientId,
  clinicId,
}: GetPatientDetailParams) => {
  const [patient, medicalRecords, vitals, attachments, upcomingAppointments] =
    await Promise.all([
      db.query.patientsTable.findFirst({
        where: and(
          eq(patientsTable.id, patientId),
          eq(patientsTable.clinicId, clinicId),
        ),
        with: {
          profile: true,
        },
      }),

      db.query.medicalRecordsTable.findMany({
        where: and(
          eq(medicalRecordsTable.patientId, patientId),
          eq(medicalRecordsTable.clinicId, clinicId),
        ),
        with: {
        },
        orderBy: [desc(medicalRecordsTable.createdAt)],
        limit: 50,
      }),

      db.query.vitalsTable.findMany({
        where: and(
          eq(vitalsTable.patientId, patientId),
          eq(vitalsTable.clinicId, clinicId),
        ),
        orderBy: [desc(vitalsTable.createdAt)],
        limit: 20,
      }),

      db.query.medicalAttachmentsTable.findMany({
        where: and(
          eq(medicalAttachmentsTable.patientId, patientId),
          eq(medicalAttachmentsTable.clinicId, clinicId),
        ),
        orderBy: [desc(medicalAttachmentsTable.createdAt)],
        limit: 20,
      }),

      db.query.appointmentsTable.findMany({
        where: and(
          eq(appointmentsTable.patientId, patientId),
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, new Date()),
        ),
        with: {
        },
        orderBy: [desc(appointmentsTable.date)],
      }),
    ]);

  return {
    patient,
    medicalRecords,
    vitals,
    attachments,
    upcomingAppointments,
  };
};
