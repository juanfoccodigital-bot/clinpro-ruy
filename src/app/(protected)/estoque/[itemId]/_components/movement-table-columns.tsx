"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

import { Badge } from "@/components/ui/badge";
import { stockMovementsTable } from "@/db/schema";

const movementTypeLabels: Record<string, string> = {
  entry: "Entrada",
  exit: "Saida",
  adjustment: "Ajuste",
};

const movementTypeColors: Record<string, string> = {
  entry: "bg-green-100 text-green-800 border-green-200",
  exit: "bg-red-100 text-red-800 border-red-200",
  adjustment: "bg-blue-100 text-blue-800 border-blue-200",
};

export type StockMovement = typeof stockMovementsTable.$inferSelect;

export const createMovementColumns = (): ColumnDef<StockMovement>[] => [
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Data",
    cell: (params) => {
      const movement = params.row.original;
      return dayjs(movement.createdAt).format("DD/MM/YYYY HH:mm");
    },
  },
  {
    id: "type",
    accessorKey: "type",
    header: "Tipo",
    cell: (params) => {
      const movement = params.row.original;
      const color = movementTypeColors[movement.type];
      return (
        <Badge variant="outline" className={color}>
          {movementTypeLabels[movement.type] ?? movement.type}
        </Badge>
      );
    },
  },
  {
    id: "quantity",
    accessorKey: "quantity",
    header: "Quantidade",
  },
  {
    id: "batch",
    accessorKey: "batch",
    header: "Lote",
    cell: (params) => {
      const movement = params.row.original;
      return movement.batch || "-";
    },
  },
  {
    id: "notes",
    accessorKey: "notes",
    header: "Observacoes",
    cell: (params) => {
      const movement = params.row.original;
      return movement.notes || "-";
    },
  },
];
