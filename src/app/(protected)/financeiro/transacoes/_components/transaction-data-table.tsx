"use client";

import { DataTable } from "@/components/ui/data-table";
import {
  financialTransactionsTable,
  patientsTable,
  paymentMachinesTable,
} from "@/db/schema";

import { createTransactionTableColumns } from "./transaction-table-columns";

type Transaction = typeof financialTransactionsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect | null;
};

interface TransactionDataTableProps {
  data: Transaction[];
  patients: (typeof patientsTable.$inferSelect)[];
  paymentMachines?: (typeof paymentMachinesTable.$inferSelect)[];
}

const TransactionDataTable = ({
  data,
  patients,
  paymentMachines = [],
}: TransactionDataTableProps) => {
  const columns = createTransactionTableColumns({ patients, paymentMachines });
  return <DataTable data={data} columns={columns} />;
};

export default TransactionDataTable;
