import dayjs from "dayjs";
import { and, asc, between, count, eq, gte, lte, sql, sum } from "drizzle-orm";

import { db } from "@/db";
import {
  aiConversationsTable,
  appointmentsTable,
  crmContactStagesTable,
  crmPipelineStagesTable,
  financialTransactionsTable,
  patientsTable,
  whatsappMessagesTable,
} from "@/db/schema";

interface Params {
  from: string;
  to: string;
  session: {
    user: {
      clinic: {
        id: string;
      };
    };
  };
}

export const getDashboard = async ({ from, to, session }: Params) => {
  const clinicId = session.user.clinic.id;
  const chartStartDate = dayjs().subtract(10, "days").startOf("day").toDate();
  const chartEndDate = dayjs().add(10, "days").endOf("day").toDate();
  const now = new Date();

  const [
    [totalRevenue],
    [totalAppointments],
    [totalPatients],
    [activeAiConversations],
    [activeWhatsappConversations],
    topDoctors,
    topSpecialties,
    dailyAppointmentsData,
    appointmentsByStatus,
    recentAppointments,
    recentPatients,
    recentTransactions,
    upcomingAppointments,
    appointmentDates,
  ] = await Promise.all([
    db
      .select({
        total: sum(appointmentsTable.appointmentPriceInCents),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      ),
    db
      .select({
        total: count(),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      ),
    db
      .select({
        total: count(),
      })
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, clinicId)),
    // Active AI conversations
    db
      .select({
        total: count(),
      })
      .from(aiConversationsTable)
      .where(
        and(
          eq(aiConversationsTable.clinicId, clinicId),
          eq(aiConversationsTable.status, "active"),
        ),
      ),
    // Active WhatsApp conversations (distinct phones in last 24h)
    db
      .select({
        total: sql<number>`COUNT(DISTINCT ${whatsappMessagesTable.remotePhone})`.as(
          "total",
        ),
      })
      .from(whatsappMessagesTable)
      .where(
        and(
          eq(whatsappMessagesTable.clinicId, clinicId),
          gte(
            whatsappMessagesTable.createdAt,
            dayjs().subtract(24, "hours").toDate(),
          ),
        ),
      ),
    // topDoctors - removed
    Promise.resolve([]),
    // topSpecialties - removed
    Promise.resolve([]),
    db
      .select({
        date: sql<string>`DATE(${appointmentsTable.date})`.as("date"),
        appointments: count(appointmentsTable.id),
        revenue:
          sql<number>`COALESCE(SUM(${appointmentsTable.appointmentPriceInCents}), 0)`.as(
            "revenue",
          ),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, chartStartDate),
          lte(appointmentsTable.date, chartEndDate),
        ),
      )
      .groupBy(sql`DATE(${appointmentsTable.date})`)
      .orderBy(sql`DATE(${appointmentsTable.date})`),
    // Appointments by status (for donut chart)
    db
      .select({
        status: appointmentsTable.status,
        total: count(),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      )
      .groupBy(appointmentsTable.status),
    // Recent appointments (for activity feed)
    db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.clinicId, clinicId),
      with: { patient: true },
      orderBy: (table, { desc: d }) => [d(table.createdAt)],
      limit: 5,
    }),
    // Recent patients
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, clinicId),
      orderBy: (table, { desc: d }) => [d(table.createdAt)],
      limit: 5,
    }),
    // Recent paid transactions
    db.query.financialTransactionsTable.findMany({
      where: and(
        eq(financialTransactionsTable.clinicId, clinicId),
        eq(financialTransactionsTable.status, "paid"),
      ),
      orderBy: (table, { desc: d }) => [d(table.createdAt)],
      limit: 5,
    }),
    // Upcoming appointments
    db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.clinicId, clinicId),
        gte(appointmentsTable.date, now),
      ),
      with: { patient: true },
      orderBy: (table) => [asc(table.date)],
      limit: 10,
    }),
    // Appointment dates for mini calendar (current month)
    db
      .select({
        date: sql<string>`DATE(${appointmentsTable.date})`.as("date"),
        total: count(),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(
            appointmentsTable.date,
            dayjs().startOf("month").toDate(),
          ),
          lte(
            appointmentsTable.date,
            dayjs().endOf("month").toDate(),
          ),
        ),
      )
      .groupBy(sql`DATE(${appointmentsTable.date})`),
  ]);

  // Build recent activities feed
  const recentActivities = [
    ...recentAppointments.map((a) => ({
      type: "appointment" as const,
      description: `Agendamento: ${a.patient.name}`,
      timestamp: a.createdAt,
    })),
    ...recentPatients.map((p) => ({
      type: "patient" as const,
      description: `Novo paciente: ${p.name}`,
      timestamp: p.createdAt,
    })),
    ...recentTransactions.map((t) => ({
      type: "transaction" as const,
      description: `Pagamento: ${t.description || "Transação"} - R$ ${(t.amountInCents / 100).toFixed(2).replace(".", ",")}`,
      timestamp: t.createdAt,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 10);

  // CRM Funnel data - leads by stage
  let leadsByStage: { stageName: string; stageColor: string; stageOrder: number; count: number }[] = [];
  try {
    leadsByStage = await db
      .select({
        stageName: crmPipelineStagesTable.name,
        stageColor: crmPipelineStagesTable.color,
        stageOrder: crmPipelineStagesTable.order,
        count: count(),
      })
      .from(crmContactStagesTable)
      .innerJoin(crmPipelineStagesTable, eq(crmContactStagesTable.stageId, crmPipelineStagesTable.id))
      .where(eq(crmContactStagesTable.clinicId, clinicId))
      .groupBy(crmPipelineStagesTable.name, crmPipelineStagesTable.color, crmPipelineStagesTable.order)
      .orderBy(crmPipelineStagesTable.order);
  } catch {
    leadsByStage = [];
  }

  // Leads by source
  let leadsBySource: { source: string | null; count: number }[] = [];
  try {
    leadsBySource = await db
      .select({
        source: patientsTable.leadSource,
        count: count(),
      })
      .from(patientsTable)
      .where(and(
        eq(patientsTable.clinicId, clinicId),
        between(patientsTable.createdAt, new Date(from), new Date(to))
      ))
      .groupBy(patientsTable.leadSource);
  } catch {
    leadsBySource = [];
  }

  // Total patients count (already have totalPatients, but we need period-specific)
  let totalPatientsAll = 0;
  try {
    const [result] = await db
      .select({ total: count() })
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, clinicId));
    totalPatientsAll = result?.total ?? 0;
  } catch {
    totalPatientsAll = 0;
  }

  // Recent leads (last 7 days count)
  let recentLeadsTotal = 0;
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [result] = await db
      .select({ total: count() })
      .from(patientsTable)
      .where(and(
        eq(patientsTable.clinicId, clinicId),
        sql`${patientsTable.createdAt} >= ${sevenDaysAgo}`
      ));
    recentLeadsTotal = result?.total ?? 0;
  } catch {
    recentLeadsTotal = 0;
  }

  return {
    totalRevenue,
    totalAppointments,
    totalPatients,
    activeConversations: {
      total:
        (Number(activeAiConversations.total) || 0) +
        (Number(activeWhatsappConversations.total) || 0),
    },
    topDoctors,
    topSpecialties,
    dailyAppointmentsData,
    appointmentsByStatus,
    recentActivities,
    upcomingAppointments,
    appointmentDates,
    leadsByStage,
    leadsBySource,
    totalPatientsAll,
    recentLeadsTotal,
  };
};
