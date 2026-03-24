"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  crmContactActivitiesTable,
  crmContactStagesTable,
  crmPipelineStagesTable,
  patientsTable,
  whatsappContactsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

export async function convertWhatsappContact(data: {
  phoneNumber: string;
  name: string;
  email?: string;
  sex: "male" | "female";
  leadSource?: string;
  leadSourceDetail?: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");
  const clinicId = session.user.clinic.id;

  // Check if patient already exists with this phone
  const existingPatient = await db.query.patientsTable.findFirst({
    where: and(
      eq(patientsTable.clinicId, clinicId),
      eq(patientsTable.phoneNumber, data.phoneNumber),
    ),
  });

  let patientId: string;

  if (existingPatient) {
    patientId = existingPatient.id;
  } else {
    // Create patient
    const [newPatient] = await db
      .insert(patientsTable)
      .values({
        clinicId,
        name: data.name,
        email: data.email || "",
        phoneNumber: data.phoneNumber,
        sex: data.sex,
        leadSource: data.leadSource || "whatsapp",
        leadSourceDetail: data.leadSourceDetail || null,
      })
      .returning();
    patientId = newPatient.id;
  }

  // Link WhatsApp contact to patient
  const whatsappContact = await db.query.whatsappContactsTable.findFirst({
    where: and(
      eq(whatsappContactsTable.clinicId, clinicId),
      eq(whatsappContactsTable.phoneNumber, data.phoneNumber),
    ),
  });

  if (whatsappContact) {
    await db
      .update(whatsappContactsTable)
      .set({ patientId })
      .where(eq(whatsappContactsTable.id, whatsappContact.id));
  }

  // Add to CRM pipeline as "Lead Novo" (first stage)
  const firstStage = await db.query.crmPipelineStagesTable.findFirst({
    where: eq(crmPipelineStagesTable.clinicId, clinicId),
    orderBy: (stages, { asc }) => [asc(stages.order)],
  });

  if (firstStage) {
    // Check if already in pipeline
    const existingStage = await db.query.crmContactStagesTable.findFirst({
      where: and(
        eq(crmContactStagesTable.patientId, patientId),
        eq(crmContactStagesTable.clinicId, clinicId),
      ),
    });

    if (!existingStage) {
      await db.insert(crmContactStagesTable).values({
        clinicId,
        patientId,
        stageId: firstStage.id,
      });
    }
  }

  // Log activity
  await db.insert(crmContactActivitiesTable).values({
    clinicId,
    patientId,
    type: "contact_created",
    description: "Contato convertido do WhatsApp para paciente",
    metadata: { source: "whatsapp", phoneNumber: data.phoneNumber },
    createdBy: session.user.name || session.user.email || null,
  });

  revalidatePath("/whatsapp");
  revalidatePath("/patients");
  revalidatePath("/crm");

  return { patientId };
}

export async function getPatientByPhone(phoneNumber: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) return null;
  const clinicId = session.user.clinic.id;

  const patient = await db.query.patientsTable.findFirst({
    where: and(
      eq(patientsTable.clinicId, clinicId),
      eq(patientsTable.phoneNumber, phoneNumber),
    ),
  });

  if (!patient) return null;

  // Get CRM stage
  const contactStage = await db.query.crmContactStagesTable.findFirst({
    where: and(
      eq(crmContactStagesTable.patientId, patient.id),
      eq(crmContactStagesTable.clinicId, clinicId),
    ),
    with: {
      stage: true,
    },
  });

  return {
    ...patient,
    crmStage: contactStage
      ? { id: contactStage.id, stageId: contactStage.stageId, stageName: contactStage.stage.name, stageColor: contactStage.stage.color }
      : null,
  };
}

export async function getCrmStagesForClinic() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) return [];
  const clinicId = session.user.clinic.id;

  const stages = await db.query.crmPipelineStagesTable.findMany({
    where: eq(crmPipelineStagesTable.clinicId, clinicId),
    orderBy: (stages, { asc }) => [asc(stages.order)],
  });

  return stages.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    order: s.order,
  }));
}
