import { and, count, eq, gte, lte, sum } from "drizzle-orm";

import { db } from "@/db";
import { financialTransactionsTable } from "@/db/schema";

interface GetFinancialSummaryParams {
  clinicId: string;
}

export const getFinancialSummary = async ({
  clinicId,
}: GetFinancialSummaryParams) => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const [
    totalIncomeResult,
    totalExpensesResult,
    pendingIncomeResult,
    pendingExpensesResult,
    overdueCountResult,
  ] = await Promise.all([
    // Total income: paid income transactions for current month
    db
      .select({
        total: sum(financialTransactionsTable.amountInCents),
      })
      .from(financialTransactionsTable)
      .where(
        and(
          eq(financialTransactionsTable.clinicId, clinicId),
          eq(financialTransactionsTable.type, "income"),
          eq(financialTransactionsTable.status, "paid"),
          gte(financialTransactionsTable.paymentDate, firstDayOfMonth),
          lte(financialTransactionsTable.paymentDate, lastDayOfMonth),
        ),
      ),

    // Total expenses: paid expense transactions for current month
    db
      .select({
        total: sum(financialTransactionsTable.amountInCents),
      })
      .from(financialTransactionsTable)
      .where(
        and(
          eq(financialTransactionsTable.clinicId, clinicId),
          eq(financialTransactionsTable.type, "expense"),
          eq(financialTransactionsTable.status, "paid"),
          gte(financialTransactionsTable.paymentDate, firstDayOfMonth),
          lte(financialTransactionsTable.paymentDate, lastDayOfMonth),
        ),
      ),

    // Pending income: pending income transactions (all time)
    db
      .select({
        total: sum(financialTransactionsTable.amountInCents),
      })
      .from(financialTransactionsTable)
      .where(
        and(
          eq(financialTransactionsTable.clinicId, clinicId),
          eq(financialTransactionsTable.type, "income"),
          eq(financialTransactionsTable.status, "pending"),
        ),
      ),

    // Pending expenses: pending expense transactions (all time)
    db
      .select({
        total: sum(financialTransactionsTable.amountInCents),
      })
      .from(financialTransactionsTable)
      .where(
        and(
          eq(financialTransactionsTable.clinicId, clinicId),
          eq(financialTransactionsTable.type, "expense"),
          eq(financialTransactionsTable.status, "pending"),
        ),
      ),

    // Overdue count
    db
      .select({
        count: count(),
      })
      .from(financialTransactionsTable)
      .where(
        and(
          eq(financialTransactionsTable.clinicId, clinicId),
          eq(financialTransactionsTable.status, "overdue"),
        ),
      ),
  ]);

  return {
    totalIncome: Number(totalIncomeResult[0]?.total ?? 0),
    totalExpenses: Number(totalExpensesResult[0]?.total ?? 0),
    pendingIncome: Number(pendingIncomeResult[0]?.total ?? 0),
    pendingExpenses: Number(pendingExpensesResult[0]?.total ?? 0),
    overdueCount: Number(overdueCountResult[0]?.count ?? 0),
  };
};
