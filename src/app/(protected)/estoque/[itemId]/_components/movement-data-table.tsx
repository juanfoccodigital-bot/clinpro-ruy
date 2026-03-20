"use client";

import { DataTable } from "@/components/ui/data-table";

import {
  createMovementColumns,
  StockMovement,
} from "./movement-table-columns";

interface MovementDataTableProps {
  data: StockMovement[];
}

const MovementDataTable = ({ data }: MovementDataTableProps) => {
  const columns = createMovementColumns();
  return <DataTable data={data} columns={columns} />;
};

export default MovementDataTable;
