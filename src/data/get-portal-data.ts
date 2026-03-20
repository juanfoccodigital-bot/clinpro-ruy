import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentsTable,
  documentsTable,
  financialTransactionsTable,
  medicalRecordsTable,
} from "@/db/schema";

interface PortalDataParams {
  patientId: string;
  clinicId: string;
}

export const getPatientAppointments = async ({
  patientId,
  clinicId,
}: PortalDataParams) => {
  const appointments = await db.query.appointmentsTable.findMany({
    where: and(
      eq(appointmentsTable.patientId, patientId),
      eq(appointmentsTable.clinicId, clinicId),
    ),
    with: {
      doctor: true,
    },
    orderBy: [desc(appointmentsTable.date)],
  });

  return appointments;
};

export const getPatientDocuments = async ({
  patientId,
  clinicId,
}: PortalDataParams) => {
  const documents = await db.query.documentsTable.findMany({
    where: and(
      eq(documentsTable.patientId, patientId),
      eq(documentsTable.clinicId, clinicId),
    ),
    with: {
      doctor: true,
    },
    orderBy: [desc(documentsTable.createdAt)],
  });

  return documents;
};

export const getPatientMedicalRecords = async ({
  patientId,
  clinicId,
}: PortalDataParams) => {
  const records = await db.query.medicalRecordsTable.findMany({
    where: and(
      eq(medicalRecordsTable.patientId, patientId),
      eq(medicalRecordsTable.clinicId, clinicId),
      eq(medicalRecordsTable.isPrivate, false),
    ),
    with: {
      doctor: true,
    },
    orderBy: [desc(medicalRecordsTable.createdAt)],
  });

  return records;
};

export const getPatientFinancials = async ({
  patientId,
  clinicId,
}: PortalDataParams) => {
  const transactions = await db.query.financialTransactionsTable.findMany({
    where: and(
      eq(financialTransactionsTable.patientId, patientId),
      eq(financialTransactionsTable.clinicId, clinicId),
    ),
    orderBy: [desc(financialTransactionsTable.createdAt)],
  });

  return transactions;
};
