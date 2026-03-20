"use client";

import { DataTable } from "@/components/ui/data-table";

import {
  createTimeRecordColumns,
  TimeRecord,
} from "./time-record-table-columns";

interface TimeRecordDataTableProps {
  data: TimeRecord[];
}

const TimeRecordDataTable = ({ data }: TimeRecordDataTableProps) => {
  const columns = createTimeRecordColumns();
  return <DataTable data={data} columns={columns} />;
};

export default TimeRecordDataTable;
