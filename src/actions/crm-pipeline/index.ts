"use server";

import { eq, and, asc } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  crmPipelineStagesTable,
  crmContactStagesTable,
  patientsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

// Get all stages for clinic
export async function getPipelineStages() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");
  const clinicId = session.user.clinic.id;

  const stages = await db.query.crmPipelineStagesTable.findMany({
    where: eq(crmPipelineStagesTable.clinicId, clinicId),
    orderBy: [asc(crmPipelineStagesTable.order)],
  });

  return stages;
}

// Create stage
export async function createPipelineStage(data: {
  name: string;
  color: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");
  const clinicId = session.user.clinic.id;

  // Get max order
  const existing = await db.query.crmPipelineStagesTable.findMany({
    where: eq(crmPipelineStagesTable.clinicId, clinicId),
  });
  const maxOrder =
    existing.length > 0
      ? Math.max(...existing.map((s) => s.order)) + 1
      : 0;

  await db.insert(crmPipelineStagesTable).values({
    clinicId,
    name: data.name,
    color: data.color,
    order: maxOrder,
  });

  revalidatePath("/crm");
}

// Update stage
export async function updatePipelineStage(data: {
  id: string;
  name?: string;
  color?: string;
  order?: number;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.order !== undefined) updateData.order = data.order;

  await db
    .update(crmPipelineStagesTable)
    .set(updateData)
    .where(
      and(
        eq(crmPipelineStagesTable.id, data.id),
        eq(crmPipelineStagesTable.clinicId, session.user.clinic.id),
      ),
    );

  revalidatePath("/crm");
}

// Delete stage
export async function deletePipelineStage(stageId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");

  await db
    .delete(crmPipelineStagesTable)
    .where(
      and(
        eq(crmPipelineStagesTable.id, stageId),
        eq(crmPipelineStagesTable.clinicId, session.user.clinic.id),
      ),
    );

  revalidatePath("/crm");
}

// Move contact to stage
export async function moveContactToStage(data: {
  patientId: string;
  stageId: string;
  notes?: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");
  const clinicId = session.user.clinic.id;

  // Upsert - if contact already has a stage, update it
  const existing = await db.query.crmContactStagesTable.findFirst({
    where: and(
      eq(crmContactStagesTable.patientId, data.patientId),
      eq(crmContactStagesTable.clinicId, clinicId),
    ),
  });

  if (existing) {
    await db
      .update(crmContactStagesTable)
      .set({ stageId: data.stageId, notes: data.notes })
      .where(eq(crmContactStagesTable.id, existing.id));
  } else {
    await db.insert(crmContactStagesTable).values({
      clinicId,
      patientId: data.patientId,
      stageId: data.stageId,
      notes: data.notes,
    });
  }

  revalidatePath("/crm");
}

// Remove contact from pipeline
export async function removeContactFromPipeline(patientId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");

  await db
    .delete(crmContactStagesTable)
    .where(
      and(
        eq(crmContactStagesTable.patientId, patientId),
        eq(crmContactStagesTable.clinicId, session.user.clinic.id),
      ),
    );

  revalidatePath("/crm");
}

// Get all contacts with their stages
export async function getContactsWithStages() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");
  const clinicId = session.user.clinic.id;

  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, clinicId),
  });

  const contactStages = await db.query.crmContactStagesTable.findMany({
    where: eq(crmContactStagesTable.clinicId, clinicId),
  });

  const stageMap = new Map(contactStages.map((cs) => [cs.patientId, cs]));

  return patients.map((p) => ({
    ...p,
    stage: stageMap.get(p.id) || null,
  }));
}

// Update reorder stages
export async function reorderPipelineStages(
  stages: { id: string; order: number }[],
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");

  for (const stage of stages) {
    await db
      .update(crmPipelineStagesTable)
      .set({ order: stage.order })
      .where(
        and(
          eq(crmPipelineStagesTable.id, stage.id),
          eq(crmPipelineStagesTable.clinicId, session.user.clinic.id),
        ),
      );
  }

  revalidatePath("/crm");
}

// Delete patient (contact)
export async function deleteContact(patientId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");

  await db
    .delete(patientsTable)
    .where(
      and(
        eq(patientsTable.id, patientId),
        eq(patientsTable.clinicId, session.user.clinic.id),
      ),
    );

  revalidatePath("/crm");
}

// Update patient (contact)
export async function updateContact(data: {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;

  await db
    .update(patientsTable)
    .set(updateData)
    .where(
      and(
        eq(patientsTable.id, data.id),
        eq(patientsTable.clinicId, session.user.clinic.id),
      ),
    );

  revalidatePath("/crm");
}
