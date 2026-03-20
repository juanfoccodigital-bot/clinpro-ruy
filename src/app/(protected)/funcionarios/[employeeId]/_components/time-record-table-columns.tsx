"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

import { timeTrackingTable } from "@/db/schema";

import TimeRecordTableActions from "./time-record-table-actions";

export type TimeRecord = typeof timeTrackingTable.$inferSelect;

const formatDuration = (clockIn: Date, clockOut: Date | null): string => {
  if (!clockOut) return "-";
  const diffMs = new Date(clockOut).getTime() - new Date(clockIn).getTime();
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, "0")}min`;
};

export const createTimeRecordColumns = (): ColumnDef<TimeRecord>[] => [
  {
    id: "clockIn",
    accessorKey: "clockIn",
    header: "Entrada",
    cell: (params) => {
      const record = params.row.original;
      return dayjs(record.clockIn).format("DD/MM/YYYY HH:mm");
    },
  },
  {
    id: "clockOut",
    accessorKey: "clockOut",
    header: "Saida",
    cell: (params) => {
      const record = params.row.original;
      return record.clockOut
        ? dayjs(record.clockOut).format("DD/MM/YYYY HH:mm")
        : "Em andamento";
    },
  },
  {
    id: "duration",
    header: "Duracao",
    cell: (params) => {
      const record = params.row.original;
      return formatDuration(record.clockIn, record.clockOut);
    },
  },
  {
    id: "notes",
    accessorKey: "notes",
    header: "Observacoes",
    cell: (params) => {
      const record = params.row.original;
      return record.notes || "-";
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const record = params.row.original;
      return <TimeRecordTableActions timeRecord={record} />;
    },
  },
];
