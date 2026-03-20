"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { stockItemsTable } from "@/db/schema";

import StockTableActions from "./stock-table-actions";

const categoryLabels: Record<string, string> = {
  medication: "Medicamento",
  material: "Material",
  equipment: "Equipamento",
  epi: "EPI",
  cleaning: "Limpeza",
  office: "Escritorio",
  other: "Outros",
};

const categoryColors: Record<string, string> = {
  medication: "bg-blue-100 text-blue-800 border-blue-200",
  material: "bg-green-100 text-green-800 border-green-200",
  equipment: "bg-amber-100 text-amber-800 border-amber-200",
  epi: "bg-orange-100 text-orange-800 border-orange-200",
  cleaning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  office: "bg-gray-100 text-gray-800 border-gray-200",
  other: "",
};

export type StockItem = typeof stockItemsTable.$inferSelect;

export const createStockColumns = (): ColumnDef<StockItem>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "category",
    accessorKey: "category",
    header: "Categoria",
    cell: (params) => {
      const item = params.row.original;
      const color = categoryColors[item.category];
      return (
        <Badge variant="outline" className={color}>
          {categoryLabels[item.category] ?? item.category}
        </Badge>
      );
    },
  },
  {
    id: "sku",
    accessorKey: "sku",
    header: "SKU",
    cell: (params) => {
      const item = params.row.original;
      return item.sku || "-";
    },
  },
  {
    id: "currentQuantity",
    accessorKey: "currentQuantity",
    header: "Qtd. Atual",
    cell: (params) => {
      const item = params.row.original;
      const isBelowMinimum = item.currentQuantity < item.minimumQuantity;
      return (
        <span className={isBelowMinimum ? "font-semibold text-red-600" : ""}>
          {item.currentQuantity}
        </span>
      );
    },
  },
  {
    id: "minimumQuantity",
    accessorKey: "minimumQuantity",
    header: "Qtd. Minima",
  },
  {
    id: "cost",
    accessorKey: "costInCents",
    header: "Custo",
    cell: (params) => {
      const item = params.row.original;
      if (!item.costInCents) return "-";
      return (item.costInCents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const item = params.row.original;
      return <StockTableActions stockItem={item} />;
    },
  },
];
