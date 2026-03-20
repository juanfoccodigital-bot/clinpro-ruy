"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

import { doctorScheduleBlocksTable } from "@/db/schema";

import BlockTableActions from "./block-table-actions";

export type ScheduleBlockWithDoctor =
  typeof doctorScheduleBlocksTable.$inferSelect;

export const createBlockColumns = (): ColumnDef<ScheduleBlockWithDoctor>[] => [
  {
    id: "title",
    accessorKey: "title",
    header: "Titulo",
  },
  {
    id: "startDate",
    header: "Inicio",
    cell: (params) => {
      const block = params.row.original;
      return dayjs(block.startDate).format("DD/MM/YYYY HH:mm");
    },
  },
  {
    id: "endDate",
    header: "Termino",
    cell: (params) => {
      const block = params.row.original;
      return dayjs(block.endDate).format("DD/MM/YYYY HH:mm");
    },
  },
  {
    id: "reason",
    accessorKey: "reason",
    header: "Motivo",
    cell: (params) => {
      const block = params.row.original;
      return block.reason ? (
        <span className="max-w-[200px] truncate block">{block.reason}</span>
      ) : (
        "-"
      );
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const block = params.row.original;
      return <BlockTableActions block={block} />;
    },
  },
];
