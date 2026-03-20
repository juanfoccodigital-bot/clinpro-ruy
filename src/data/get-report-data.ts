import dayjs from "dayjs";
import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentsTable,
  doctorsTable,
  financialTransactionsTable,
  patientsTable,
} from "@/db/schema";

// ============================================================
// OCCUPANCY REPORT
// ============================================================

interface GetOccupancyReportParams {
  clinicId: string;
  startDate: string;
  endDate: string;
}

export const getOccupancyReport = async ({
  clinicId,
  startDate,
  endDate,
}: GetOccupancyReportParams) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Get all appointments within the date range grouped by doctor with status counts
  const doctorStats = await db
    .select({
      doctorId: doctorsTable.id,
      doctorName: doctorsTable.name,
      total: count(appointmentsTable.id),
      completed:
        sql<number>`COUNT(CASE WHEN ${appointmentsTable.status} = 'completed' THEN 1 END)`.as(
          "completed",
        ),
      cancelled:
        sql<number>`COUNT(CASE WHEN ${appointmentsTable.status} = 'cancelled' THEN 1 END)`.as(
          "cancelled",
        ),
      noShow:
        sql<number>`COUNT(CASE WHEN ${appointmentsTable.status} = 'no_show' THEN 1 END)`.as(
          "no_show",
        ),
    })
    .from(doctorsTable)
    .leftJoin(
      appointmentsTable,
      and(
        eq(appointmentsTable.doctorId, doctorsTable.id),
        gte(appointmentsTable.date, start),
        lte(appointmentsTable.date, end),
      ),
    )
    .where(eq(doctorsTable.clinicId, clinicId))
    .groupBy(doctorsTable.id, doctorsTable.name)
    .orderBy(desc(count(appointmentsTable.id)));

  return doctorStats.map((row) => ({
    doctorId: row.doctorId,
    doctorName: row.doctorName,
    total: row.total,
    completed: Number(row.completed),
    cancelled: Number(row.cancelled),
    noShow: Number(row.noShow),
    occupancyRate:
      row.total > 0
        ? Math.round((Number(row.completed) / row.total) * 100)
        : 0,
  }));
};

// ============================================================
// PATIENT REPORT
// ============================================================

interface GetPatientReportParams {
  clinicId: string;
}

export const getPatientReport = async ({
  clinicId,
}: GetPatientReportParams) => {
  const now = new Date();
  const firstDayOfMonth = dayjs(now).startOf("month").toDate();
  const lastDayOfMonth = dayjs(now).endOf("month").toDate();

  const [
    [totalPatientsResult],
    [newThisMonthResult],
    sexDistribution,
    topPatients,
  ] = await Promise.all([
    // Total patients
    db
      .select({ total: count() })
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, clinicId)),

    // New patients this month
    db
      .select({ total: count() })
      .from(patientsTable)
      .where(
        and(
          eq(patientsTable.clinicId, clinicId),
          gte(patientsTable.createdAt, firstDayOfMonth),
          lte(patientsTable.createdAt, lastDayOfMonth),
        ),
      ),

    // Distribution by sex
    db
      .select({
        sex: patientsTable.sex,
        count: count(),
      })
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, clinicId))
      .groupBy(patientsTable.sex),

    // Most active patients (most appointments)
    db
      .select({
        patientId: patientsTable.id,
        patientName: patientsTable.name,
        email: patientsTable.email,
        phoneNumber: patientsTable.phoneNumber,
        appointments: count(appointmentsTable.id),
      })
      .from(patientsTable)
      .leftJoin(
        appointmentsTable,
        eq(appointmentsTable.patientId, patientsTable.id),
      )
      .where(eq(patientsTable.clinicId, clinicId))
      .groupBy(
        patientsTable.id,
        patientsTable.name,
        patientsTable.email,
        patientsTable.phoneNumber,
      )
      .orderBy(desc(count(appointmentsTable.id)))
      .limit(10),
  ]);

  const bySex: Record<string, number> = { male: 0, female: 0 };
  for (const row of sexDistribution) {
    if (row.sex) {
      bySex[row.sex] = row.count;
    }
  }

  return {
    totalPatients: totalPatientsResult?.total ?? 0,
    newThisMonth: newThisMonthResult?.total ?? 0,
    bySex,
    topPatients,
  };
};

// ============================================================
// FINANCIAL REPORT
// ============================================================

interface GetFinancialReportParams {
  clinicId: string;
  startDate: string;
  endDate: string;
}

export const getFinancialReport = async ({
  clinicId,
  startDate,
  endDate,
}: GetFinancialReportParams) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const dateFilter = and(
    eq(financialTransactionsTable.clinicId, clinicId),
    eq(financialTransactionsTable.status, "paid"),
    gte(financialTransactionsTable.paymentDate, start),
    lte(financialTransactionsTable.paymentDate, end),
  );

  const [
    [totalRevenueResult],
    [totalExpensesResult],
    byCategory,
    byPaymentMethod,
    monthlyTrend,
  ] = await Promise.all([
    // Total revenue (income)
    db
      .select({
        total: sum(financialTransactionsTable.amountInCents),
      })
      .from(financialTransactionsTable)
      .where(
        and(dateFilter, eq(financialTransactionsTable.type, "income")),
      ),

    // Total expenses
    db
      .select({
        total: sum(financialTransactionsTable.amountInCents),
      })
      .from(financialTransactionsTable)
      .where(
        and(dateFilter, eq(financialTransactionsTable.type, "expense")),
      ),

    // Revenue by category
    db
      .select({
        category: financialTransactionsTable.category,
        total: sum(financialTransactionsTable.amountInCents),
      })
      .from(financialTransactionsTable)
      .where(
        and(dateFilter, eq(financialTransactionsTable.type, "income")),
      )
      .groupBy(financialTransactionsTable.category)
      .orderBy(desc(sum(financialTransactionsTable.amountInCents))),

    // Revenue by payment method
    db
      .select({
        paymentMethod: financialTransactionsTable.paymentMethod,
        total: sum(financialTransactionsTable.amountInCents),
      })
      .from(financialTransactionsTable)
      .where(
        and(dateFilter, eq(financialTransactionsTable.type, "income")),
      )
      .groupBy(financialTransactionsTable.paymentMethod)
      .orderBy(desc(sum(financialTransactionsTable.amountInCents))),

    // Monthly revenue trend (income - expense by month)
    db
      .select({
        month:
          sql<string>`TO_CHAR(${financialTransactionsTable.paymentDate}, 'YYYY-MM')`.as(
            "month",
          ),
        revenue:
          sql<number>`COALESCE(SUM(CASE WHEN ${financialTransactionsTable.type} = 'income' THEN ${financialTransactionsTable.amountInCents} ELSE 0 END), 0)`.as(
            "revenue",
          ),
        expenses:
          sql<number>`COALESCE(SUM(CASE WHEN ${financialTransactionsTable.type} = 'expense' THEN ${financialTransactionsTable.amountInCents} ELSE 0 END), 0)`.as(
            "expenses",
          ),
      })
      .from(financialTransactionsTable)
      .where(
        and(
          eq(financialTransactionsTable.clinicId, clinicId),
          eq(financialTransactionsTable.status, "paid"),
          gte(financialTransactionsTable.paymentDate, start),
          lte(financialTransactionsTable.paymentDate, end),
        ),
      )
      .groupBy(
        sql`TO_CHAR(${financialTransactionsTable.paymentDate}, 'YYYY-MM')`,
      )
      .orderBy(
        sql`TO_CHAR(${financialTransactionsTable.paymentDate}, 'YYYY-MM')`,
      ),
  ]);

  const totalRevenue = Number(totalRevenueResult?.total ?? 0);
  const totalExpenses = Number(totalExpensesResult?.total ?? 0);

  return {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    byCategory: byCategory.map((row) => ({
      category: row.category,
      total: Number(row.total ?? 0),
    })),
    byPaymentMethod: byPaymentMethod.map((row) => ({
      paymentMethod: row.paymentMethod,
      total: Number(row.total ?? 0),
    })),
    monthlyTrend: monthlyTrend.map((row) => ({
      month: row.month,
      revenue: Number(row.revenue),
      expenses: Number(row.expenses),
    })),
  };
};

// ============================================================
// APPOINTMENT REPORT
// ============================================================

interface GetAppointmentReportParams {
  clinicId: string;
  startDate: string;
  endDate: string;
}

export const getAppointmentReport = async ({
  clinicId,
  startDate,
  endDate,
}: GetAppointmentReportParams) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const appointmentDateFilter = and(
    eq(appointmentsTable.clinicId, clinicId),
    gte(appointmentsTable.date, start),
    lte(appointmentsTable.date, end),
  );

  const [
    [totalResult],
    byStatus,
    byDoctor,
    dailyDistribution,
  ] = await Promise.all([
    // Total appointments in period
    db
      .select({ total: count() })
      .from(appointmentsTable)
      .where(appointmentDateFilter),

    // By status
    db
      .select({
        status: appointmentsTable.status,
        count: count(),
      })
      .from(appointmentsTable)
      .where(appointmentDateFilter)
      .groupBy(appointmentsTable.status)
      .orderBy(desc(count())),

    // By doctor
    db
      .select({
        doctorId: doctorsTable.id,
        doctorName: doctorsTable.name,
        specialty: doctorsTable.specialty,
        count: count(appointmentsTable.id),
      })
      .from(appointmentsTable)
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(appointmentDateFilter)
      .groupBy(doctorsTable.id, doctorsTable.name, doctorsTable.specialty)
      .orderBy(desc(count(appointmentsTable.id))),

    // Daily distribution
    db
      .select({
        date: sql<string>`DATE(${appointmentsTable.date})`.as("date"),
        count: count(),
      })
      .from(appointmentsTable)
      .where(appointmentDateFilter)
      .groupBy(sql`DATE(${appointmentsTable.date})`)
      .orderBy(sql`DATE(${appointmentsTable.date})`),
  ]);

  const total = totalResult?.total ?? 0;

  // Calculate number of days in period for average
  const daysDiff = dayjs(endDate).diff(dayjs(startDate), "day") + 1;
  const avgPerDay = daysDiff > 0 ? Number((total / daysDiff).toFixed(1)) : 0;

  return {
    total,
    byStatus: byStatus.map((row) => ({
      status: row.status,
      count: row.count,
    })),
    byDoctor: byDoctor.map((row) => ({
      doctorId: row.doctorId,
      doctorName: row.doctorName,
      specialty: row.specialty,
      count: row.count,
    })),
    dailyDistribution: dailyDistribution.map((row) => ({
      date: row.date,
      count: row.count,
    })),
    avgPerDay,
  };
};
