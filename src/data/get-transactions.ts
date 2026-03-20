import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { financialTransactionsTable } from "@/db/schema";

interface GetTransactionsParams {
  clinicId: string;
}

export const getTransactions = async ({ clinicId }: GetTransactionsParams) => {
  const transactions = await db.query.financialTransactionsTable.findMany({
    where: eq(financialTransactionsTable.clinicId, clinicId),
    with: {
      patient: true,
      doctor: true,
    },
    orderBy: [desc(financialTransactionsTable.createdAt)],
    limit: 200,
  });

  return transactions;
};
