"use client";

import { DataTable } from "@/components/ui/data-table";
import { patientsTable } from "@/db/schema";

import {
  createWaitingListColumns,
  WaitingListItemWithRelations,
} from "./waiting-list-table-columns";

interface WaitingListDataTableProps {
  data: WaitingListItemWithRelations[];
  patients: (typeof patientsTable.$inferSelect)[];
}

const WaitingListDataTable = ({
  data,
  patients,
}: WaitingListDataTableProps) => {
  const columns = createWaitingListColumns(patients);
  return <DataTable data={data} columns={columns} />;
};

export default WaitingListDataTable;
