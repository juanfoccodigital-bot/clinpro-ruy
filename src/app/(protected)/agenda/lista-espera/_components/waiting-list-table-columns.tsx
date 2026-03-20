"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

import { Badge } from "@/components/ui/badge";
import {
  patientsTable,
  waitingListTable,
} from "@/db/schema";

import WaitingListTableActions from "./waiting-list-table-actions";

export type WaitingListItemWithRelations =
  typeof waitingListTable.$inferSelect & {
    patient: typeof patientsTable.$inferSelect;
  };

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  waiting: {
    label: "Aguardando",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  contacted: {
    label: "Contatado",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  scheduled: {
    label: "Agendado",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

export const createWaitingListColumns = (
  patients: (typeof patientsTable.$inferSelect)[],
): ColumnDef<WaitingListItemWithRelations>[] => [
  {
    id: "patient",
    accessorKey: "patient.name",
    header: "Paciente",
    cell: (params) => {
      const item = params.row.original;
      return item.patient.name;
    },
  },
  {
    id: "preferredDate",
    header: "Data preferida",
    cell: (params) => {
      const item = params.row.original;
      return item.preferredDate
        ? dayjs(item.preferredDate).format("DD/MM/YYYY")
        : "-";
    },
  },
  {
    id: "status",
    header: "Status",
    cell: (params) => {
      const item = params.row.original;
      const config = statusConfig[item.status] ?? {
        label: item.status,
        className: "",
      };
      return (
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "notes",
    accessorKey: "notes",
    header: "Observacoes",
    cell: (params) => {
      const item = params.row.original;
      return item.notes ? (
        <span className="max-w-[200px] truncate block">{item.notes}</span>
      ) : (
        "-"
      );
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const item = params.row.original;
      return (
        <WaitingListTableActions
          item={item}
          patients={patients}
        />
      );
    },
  },
];
