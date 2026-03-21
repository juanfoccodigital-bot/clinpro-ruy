import { and, between, count, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  crmContactStagesTable,
  crmPipelineStagesTable,
  patientsTable,
} from "@/db/schema";

interface CommercialDashboardParams {
  clinicId: string;
  from: string;
  to: string;
}

export async function getCommercialDashboard({
  clinicId,
  from,
  to,
}: CommercialDashboardParams) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  // Set toDate to end of day
  toDate.setHours(23, 59, 59, 999);

  const [totalLeadsResult, leadsByStage, dailyLeads] = await Promise.all([
    // Total leads in period
    db
      .select({ total: count() })
      .from(patientsTable)
      .where(
        and(
          eq(patientsTable.clinicId, clinicId),
          between(patientsTable.createdAt, fromDate, toDate),
        ),
      ),

    // Leads by pipeline stage
    db
      .select({
        stageName: crmPipelineStagesTable.name,
        stageColor: crmPipelineStagesTable.color,
        count: count(),
      })
      .from(crmContactStagesTable)
      .innerJoin(
        crmPipelineStagesTable,
        eq(crmContactStagesTable.stageId, crmPipelineStagesTable.id),
      )
      .where(eq(crmContactStagesTable.clinicId, clinicId))
      .groupBy(
        crmPipelineStagesTable.name,
        crmPipelineStagesTable.color,
        crmPipelineStagesTable.order,
      )
      .orderBy(crmPipelineStagesTable.order),

    // Daily leads
    db
      .select({
        date: sql<string>`DATE(${patientsTable.createdAt})`,
        count: count(),
      })
      .from(patientsTable)
      .where(
        and(
          eq(patientsTable.clinicId, clinicId),
          between(patientsTable.createdAt, fromDate, toDate),
        ),
      )
      .groupBy(sql`DATE(${patientsTable.createdAt})`)
      .orderBy(sql`DATE(${patientsTable.createdAt})`),
  ]);

  // Leads by source
  let leadsBySource: { source: string | null; count: number }[] = [];
  try {
    leadsBySource = await db
      .select({
        source: patientsTable.leadSource,
        count: count(),
      })
      .from(patientsTable)
      .where(
        and(
          eq(patientsTable.clinicId, clinicId),
          between(patientsTable.createdAt, fromDate, toDate),
        ),
      )
      .groupBy(patientsTable.leadSource);
  } catch {
    // lead_source column may not exist yet - gracefully handle
    leadsBySource = [];
  }

  // Conversion metrics
  const agendadoStage = leadsByStage.find((s) => s.stageName === "Agendado");
  const concluidoStage = leadsByStage.find((s) => s.stageName === "Concluído");
  const perdidoStage = leadsByStage.find((s) => s.stageName === "Perdido");
  const totalInPipeline = leadsByStage.reduce(
    (sum, s) => sum + Number(s.count),
    0,
  );
  const converted =
    Number(agendadoStage?.count || 0) + Number(concluidoStage?.count || 0);
  const conversionRate =
    totalInPipeline > 0 ? (converted / totalInPipeline) * 100 : 0;

  const totalPatients = Number(totalLeadsResult[0]?.total || 0);
  const withoutStage = Math.max(0, totalPatients - totalInPipeline);
  const lost = Number(perdidoStage?.count || 0);

  return {
    totalLeads: totalPatients,
    totalInPipeline,
    withoutStage,
    converted,
    conversionRate,
    lost,
    leadsByStage,
    leadsBySource,
    dailyLeads,
  };
}
