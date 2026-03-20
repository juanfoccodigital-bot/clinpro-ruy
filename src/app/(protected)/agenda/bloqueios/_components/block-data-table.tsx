"use client";

import { DataTable } from "@/components/ui/data-table";

import {
  createBlockColumns,
  ScheduleBlockWithDoctor,
} from "./block-table-columns";

interface BlockDataTableProps {
  data: ScheduleBlockWithDoctor[];
}

const BlockDataTable = ({ data }: BlockDataTableProps) => {
  const columns = createBlockColumns();
  return <DataTable data={data} columns={columns} />;
};

export default BlockDataTable;
