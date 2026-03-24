"use server";

import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  crmContactActivitiesTable,
  crmContactChecklistTable,
  crmContactStagesTable,
  crmPipelineStagesTable,
  crmStageChecklistItemsTable,
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

  // Log activity
  const stage = await db.query.crmPipelineStagesTable.findFirst({
    where: eq(crmPipelineStagesTable.id, data.stageId),
  });
  if (stage) {
    await db.insert(crmContactActivitiesTable).values({
      clinicId,
      patientId: data.patientId,
      type: "stage_moved",
      description: `Movido para ${stage.name}`,
      metadata: { stageId: data.stageId, stageName: stage.name },
      createdBy: session.user.name || session.user.email || null,
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
export async function getContactsWithStages(search?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");
  const clinicId = session.user.clinic.id;

  const searchCondition = search
    ? or(
        ilike(patientsTable.name, `%${search}%`),
        ilike(patientsTable.phoneNumber, `%${search}%`),
      )
    : undefined;

  // Get all contact stages first
  const contactStages = await db.query.crmContactStagesTable.findMany({
    where: eq(crmContactStagesTable.clinicId, clinicId),
  });
  const stageMap = new Map(contactStages.map((cs) => [cs.patientId, cs]));

  // When searching, load matching patients (limited)
  // When not searching, load only patients in pipeline + recent ones (limit 200 total)
  const patients = await db.query.patientsTable.findMany({
    where: and(eq(patientsTable.clinicId, clinicId), searchCondition),
    orderBy: (table, { desc: d }) => [d(table.createdAt)],
    limit: search ? 50 : 200,
  });

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
  const clinicId = session.user.clinic.id;

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
        eq(patientsTable.clinicId, clinicId),
      ),
    );

  // Log activity
  await db.insert(crmContactActivitiesTable).values({
    clinicId,
    patientId: data.id,
    type: "data_updated",
    description: "Dados atualizados",
    createdBy: session.user.name || session.user.email || null,
  });

  revalidatePath("/crm");
}

// ============================================================
// CHECKLIST ACTIONS
// ============================================================

// Get checklist items for a stage
export async function getStageChecklistItems(stageId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");

  const items = await db.query.crmStageChecklistItemsTable.findMany({
    where: and(
      eq(crmStageChecklistItemsTable.stageId, stageId),
      eq(crmStageChecklistItemsTable.clinicId, session.user.clinic.id),
    ),
    orderBy: [asc(crmStageChecklistItemsTable.order)],
  });

  return items;
}

// Create checklist item for a stage
export async function createChecklistItem(data: {
  stageId: string;
  label: string;
  moveToStageId?: string | null;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");
  const clinicId = session.user.clinic.id;

  // Get max order
  const existing = await db.query.crmStageChecklistItemsTable.findMany({
    where: and(
      eq(crmStageChecklistItemsTable.stageId, data.stageId),
      eq(crmStageChecklistItemsTable.clinicId, clinicId),
    ),
  });
  const maxOrder =
    existing.length > 0
      ? Math.max(...existing.map((i) => i.order)) + 1
      : 0;

  await db.insert(crmStageChecklistItemsTable).values({
    stageId: data.stageId,
    clinicId,
    label: data.label,
    order: maxOrder,
    moveToStageId: data.moveToStageId || null,
  });

  revalidatePath("/crm");
}

// Update checklist item rule (moveToStageId)
export async function updateChecklistItemRule(data: {
  itemId: string;
  moveToStageId: string | null;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");

  await db
    .update(crmStageChecklistItemsTable)
    .set({ moveToStageId: data.moveToStageId })
    .where(
      and(
        eq(crmStageChecklistItemsTable.id, data.itemId),
        eq(crmStageChecklistItemsTable.clinicId, session.user.clinic.id),
      ),
    );

  revalidatePath("/crm");
}

// Delete checklist item
export async function deleteChecklistItem(itemId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");

  await db
    .delete(crmStageChecklistItemsTable)
    .where(
      and(
        eq(crmStageChecklistItemsTable.id, itemId),
        eq(crmStageChecklistItemsTable.clinicId, session.user.clinic.id),
      ),
    );

  revalidatePath("/crm");
}

// Toggle checklist completion for a contact
export async function toggleContactChecklist(data: {
  contactStageId: string;
  checklistItemId: string;
  completed: boolean;
}): Promise<{ autoMoved: boolean; newStageName?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");
  const clinicId = session.user.clinic.id;

  // Check if record exists
  const existing = await db.query.crmContactChecklistTable.findFirst({
    where: and(
      eq(crmContactChecklistTable.contactStageId, data.contactStageId),
      eq(crmContactChecklistTable.checklistItemId, data.checklistItemId),
    ),
  });

  if (existing) {
    await db
      .update(crmContactChecklistTable)
      .set({
        completed: data.completed,
        completedAt: data.completed ? new Date() : null,
      })
      .where(eq(crmContactChecklistTable.id, existing.id));
  } else {
    await db.insert(crmContactChecklistTable).values({
      contactStageId: data.contactStageId,
      checklistItemId: data.checklistItemId,
      completed: data.completed,
      completedAt: data.completed ? new Date() : null,
    });
  }

  // Auto-move logic when marking as complete
  if (data.completed) {
    // Get the contact stage record to find current stageId and patientId
    const contactStage = await db.query.crmContactStagesTable.findFirst({
      where: eq(crmContactStagesTable.id, data.contactStageId),
    });

    if (contactStage) {
      // Log checklist completion activity
      const checklistItem = await db.query.crmStageChecklistItemsTable.findFirst({
        where: eq(crmStageChecklistItemsTable.id, data.checklistItemId),
      });
      if (checklistItem) {
        await db.insert(crmContactActivitiesTable).values({
          clinicId,
          patientId: contactStage.patientId,
          type: "checklist_completed",
          description: `Checklist concluído: ${checklistItem.label}`,
          metadata: { checklistItemId: data.checklistItemId, label: checklistItem.label },
          createdBy: session.user.name || session.user.email || null,
        });

        // Rule: if this specific item has moveToStageId, move the contact there
        if (checklistItem.moveToStageId) {
          const targetStage = await db.query.crmPipelineStagesTable.findFirst({
            where: eq(crmPipelineStagesTable.id, checklistItem.moveToStageId),
          });

          if (targetStage) {
            await db
              .update(crmContactStagesTable)
              .set({ stageId: targetStage.id })
              .where(eq(crmContactStagesTable.id, data.contactStageId));

            // Log the auto-move activity
            await db.insert(crmContactActivitiesTable).values({
              clinicId,
              patientId: contactStage.patientId,
              type: "stage_moved",
              description: `Movido para ${targetStage.name}`,
              metadata: {
                stageId: targetStage.id,
                stageName: targetStage.name,
                trigger: "checklist_rule",
                checklistItemLabel: checklistItem.label,
              },
              createdBy: session.user.name || session.user.email || null,
            });

            revalidatePath("/crm");
            return { autoMoved: true, newStageName: targetStage.name };
          }
        }
      }

      // Fallback: if ALL items completed, move to next stage by order
      const stageItems = await db.query.crmStageChecklistItemsTable.findMany({
        where: and(
          eq(crmStageChecklistItemsTable.stageId, contactStage.stageId),
          eq(crmStageChecklistItemsTable.clinicId, clinicId),
        ),
      });

      if (stageItems.length > 0) {
        const completedItems = await db.query.crmContactChecklistTable.findMany({
          where: eq(crmContactChecklistTable.contactStageId, data.contactStageId),
        });

        const completedItemIds = new Set(
          completedItems
            .filter((item) => item.completed)
            .map((item) => item.checklistItemId),
        );

        const allCompleted = stageItems.every((item) => completedItemIds.has(item.id));

        if (allCompleted) {
          const currentStage = await db.query.crmPipelineStagesTable.findFirst({
            where: and(
              eq(crmPipelineStagesTable.id, contactStage.stageId),
              eq(crmPipelineStagesTable.clinicId, clinicId),
            ),
          });

          if (currentStage) {
            const allStages = await db.query.crmPipelineStagesTable.findMany({
              where: eq(crmPipelineStagesTable.clinicId, clinicId),
              orderBy: [asc(crmPipelineStagesTable.order)],
            });

            const nextStage = allStages.find((s) => s.order > currentStage.order);

            if (nextStage) {
              await db
                .update(crmContactStagesTable)
                .set({ stageId: nextStage.id })
                .where(eq(crmContactStagesTable.id, data.contactStageId));

              // Log auto-move activity
              await db.insert(crmContactActivitiesTable).values({
                clinicId,
                patientId: contactStage.patientId,
                type: "stage_moved",
                description: `Movido para ${nextStage.name}`,
                metadata: {
                  stageId: nextStage.id,
                  stageName: nextStage.name,
                  trigger: "all_checklist_completed",
                },
                createdBy: session.user.name || session.user.email || null,
              });

              revalidatePath("/crm");
              return { autoMoved: true, newStageName: nextStage.name };
            }
          }
        }
      }
    }
  }

  revalidatePath("/crm");
  return { autoMoved: false };
}

// Get contact checklist status
export async function getContactChecklist(contactStageId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");

  const items = await db.query.crmContactChecklistTable.findMany({
    where: eq(crmContactChecklistTable.contactStageId, contactStageId),
  });

  return items;
}

// Get all checklist data for all contacts (batch)
export async function getAllChecklistData() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");
  const clinicId = session.user.clinic.id;

  const stageItems = await db.query.crmStageChecklistItemsTable.findMany({
    where: eq(crmStageChecklistItemsTable.clinicId, clinicId),
    orderBy: [asc(crmStageChecklistItemsTable.order)],
  });

  const contactStages = await db.query.crmContactStagesTable.findMany({
    where: eq(crmContactStagesTable.clinicId, clinicId),
  });

  // Fetch all checklist completions in ONE query using SQL IN
  const contactStageIds = contactStages.map((cs) => cs.id);
  let contactChecklist: typeof crmContactChecklistTable.$inferSelect[] = [];

  if (contactStageIds.length > 0) {
    const { inArray } = await import("drizzle-orm");
    contactChecklist = await db.query.crmContactChecklistTable.findMany({
      where: inArray(crmContactChecklistTable.contactStageId, contactStageIds),
    });
  }

  return { stageItems, contactChecklist };
}

// ============================================================
// ACTIVITY LOG ACTIONS
// ============================================================

// Log a contact activity
export async function logContactActivity(data: {
  patientId: string;
  type: string;
  description: string;
  metadata?: Record<string, unknown>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");
  const clinicId = session.user.clinic.id;

  await db.insert(crmContactActivitiesTable).values({
    clinicId,
    patientId: data.patientId,
    type: data.type,
    description: data.description,
    metadata: data.metadata || null,
    createdBy: session.user.name || session.user.email || null,
  });

  revalidatePath("/crm");
}

// Get all activities for a contact
export async function getContactActivities(patientId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) throw new Error("Unauthorized");

  const activities = await db.query.crmContactActivitiesTable.findMany({
    where: and(
      eq(crmContactActivitiesTable.patientId, patientId),
      eq(crmContactActivitiesTable.clinicId, session.user.clinic.id),
    ),
    orderBy: [desc(crmContactActivitiesTable.createdAt)],
  });

  return activities;
}
