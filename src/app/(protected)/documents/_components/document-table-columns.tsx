"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { documentsTable, patientsTable } from "@/db/schema";

import DocumentTableActions from "./document-table-actions";

type Document = typeof documentsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect;
};

const documentTypeLabels: Record<string, string> = {
  prescription: "Receita",
  certificate: "Atestado",
  report: "Laudo",
  exam_request: "Sol. Exame",
  referral: "Encaminhamento",
};

const documentTypeBadgeClasses: Record<string, string> = {
  prescription: "bg-blue-100 text-blue-800 border-blue-200",
  certificate: "bg-green-100 text-green-800 border-green-200",
  report: "bg-amber-100 text-amber-800 border-amber-200",
  exam_request: "bg-orange-100 text-orange-800 border-orange-200",
  referral: "bg-rose-100 text-rose-800 border-rose-200",
};

interface CreateDocumentTableColumnsProps {
  patients: (typeof patientsTable.$inferSelect)[];
}

export const createDocumentTableColumns = ({
  patients,
}: CreateDocumentTableColumnsProps): ColumnDef<Document>[] => [
  {
    id: "title",
    accessorKey: "title",
    header: "Título",
  },
  {
    id: "type",
    accessorKey: "type",
    header: "Tipo",
    cell: (params) => {
      const document = params.row.original;
      const label = documentTypeLabels[document.type] ?? document.type;
      const badgeClass = documentTypeBadgeClasses[document.type] ?? "";
      return (
        <Badge variant="outline" className={badgeClass}>
          {label}
        </Badge>
      );
    },
  },
  {
    id: "patient",
    header: "Paciente",
    cell: (params) => {
      const document = params.row.original;
      return document.patient.name;
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Data",
    cell: (params) => {
      const document = params.row.original;
      return format(new Date(document.createdAt), "dd/MM/yyyy");
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const document = params.row.original;
      return (
        <DocumentTableActions
          document={document}
          patients={patients}
        />
      );
    },
  },
];
