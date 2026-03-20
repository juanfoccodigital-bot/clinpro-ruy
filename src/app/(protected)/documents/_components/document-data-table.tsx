"use client";

import { DataTable } from "@/components/ui/data-table";
import { documentsTable, patientsTable } from "@/db/schema";

import { createDocumentTableColumns } from "./document-table-columns";

type Document = typeof documentsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect;
};

interface DocumentDataTableProps {
  data: Document[];
  patients: (typeof patientsTable.$inferSelect)[];
}

const DocumentDataTable = ({
  data,
  patients,
}: DocumentDataTableProps) => {
  const columns = createDocumentTableColumns({ patients });
  return <DataTable data={data} columns={columns} />;
};

export default DocumentDataTable;
