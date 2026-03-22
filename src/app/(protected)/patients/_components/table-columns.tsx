"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { patientsTable } from "@/db/schema";

import PatientsTableActions from "./table-actions";

type Patient = typeof patientsTable.$inferSelect;

export const patientsTableColumns: ColumnDef<Patient>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
    cell: (params) => {
      const patient = params.row.original;
      return <span className="font-medium">{patient.name}</span>;
    },
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
    cell: (params) => {
      const patient = params.row.original;
      return (
        <span className="text-muted-foreground">{patient.email}</span>
      );
    },
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Telefone",
    cell: (params) => {
      const patient = params.row.original;
      const phoneNumber = patient.phoneNumber;
      if (!phoneNumber) return <span className="text-muted-foreground/50">—</span>;
      const formatted = phoneNumber.replace(
        /(\d{2})(\d{5})(\d{4})/,
        "($1) $2-$3",
      );
      return <span className="font-mono text-sm">{formatted}</span>;
    },
  },
  {
    id: "sex",
    accessorKey: "sex",
    header: "Sexo",
    cell: (params) => {
      const patient = params.row.original;
      return (
        <Badge variant="outline" className="text-xs">
          {patient.sex === "male" ? "Masculino" : "Feminino"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const patient = params.row.original;
      return <PatientsTableActions patient={patient} />;
    },
  },
];
