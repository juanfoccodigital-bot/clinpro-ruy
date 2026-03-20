"use client";

import { DataTable } from "@/components/ui/data-table";

import { createStockColumns, StockItem } from "./stock-table-columns";

interface StockDataTableProps {
  data: StockItem[];
}

const StockDataTable = ({ data }: StockDataTableProps) => {
  const columns = createStockColumns();
  return <DataTable data={data} columns={columns} />;
};

export default StockDataTable;
