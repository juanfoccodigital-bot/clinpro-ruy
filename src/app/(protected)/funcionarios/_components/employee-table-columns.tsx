"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { employeesTable } from "@/db/schema";

import EmployeeTableActions from "./employee-table-actions";

const roleLabels: Record<string, string> = {
  admin: "Admin",
  doctor: "Outro",
  receptionist: "Recepcionista",
  nurse: "Enfermeiro(a)",
  manager: "Gerente",
  other: "Outro",
};

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800 border-red-200",
  doctor: "bg-blue-100 text-blue-800 border-blue-200",
  receptionist: "bg-green-100 text-green-800 border-green-200",
  nurse: "bg-amber-100 text-amber-800 border-amber-200",
  manager: "bg-orange-100 text-orange-800 border-orange-200",
  other: "bg-gray-100 text-gray-800 border-gray-200",
};

export type Employee = typeof employeesTable.$inferSelect;

export const createEmployeeColumns = (): ColumnDef<Employee>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "role",
    accessorKey: "role",
    header: "Cargo",
    cell: (params) => {
      const employee = params.row.original;
      const color = roleColors[employee.role];
      return (
        <Badge variant="outline" className={color}>
          {roleLabels[employee.role] ?? employee.role}
        </Badge>
      );
    },
  },
  {
    id: "email",
    accessorKey: "email",
    header: "E-mail",
    cell: (params) => {
      const employee = params.row.original;
      return employee.email || "-";
    },
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Telefone",
    cell: (params) => {
      const employee = params.row.original;
      return employee.phoneNumber || "-";
    },
  },
  {
    id: "isActive",
    accessorKey: "isActive",
    header: "Status",
    cell: (params) => {
      const employee = params.row.original;
      return employee.isActive ? (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          Ativo
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          Inativo
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const employee = params.row.original;
      return <EmployeeTableActions employee={employee} />;
    },
  },
];
