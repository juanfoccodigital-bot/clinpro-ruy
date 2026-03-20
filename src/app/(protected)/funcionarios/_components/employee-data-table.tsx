"use client";

import { DataTable } from "@/components/ui/data-table";

import { createEmployeeColumns, Employee } from "./employee-table-columns";

interface EmployeeDataTableProps {
  data: Employee[];
}

const EmployeeDataTable = ({ data }: EmployeeDataTableProps) => {
  const columns = createEmployeeColumns();
  return <DataTable data={data} columns={columns} />;
};

export default EmployeeDataTable;
