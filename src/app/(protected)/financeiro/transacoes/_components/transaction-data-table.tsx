"use client";

import { DataTable } from "@/components/ui/data-table";
import {
  financialTransactionsTable,
  patientsTable,
} from "@/db/schema";

import { createTransactionTableColumns } from "./transaction-table-columns";

type Transaction = typeof financialTransactionsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect | null;
};

interface TransactionDataTableProps {
  data: Transaction[];
  patients: (typeof patientsTable.$inferSelect)[];
}

const TransactionDataTable = ({
  data,
  patients,
}: TransactionDataTableProps) => {
  const columns = createTransactionTableColumns({ patients });
  return <DataTable data={data} columns={columns} />;
};

export default TransactionDataTable;
