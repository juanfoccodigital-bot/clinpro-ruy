"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";

import AddRetentionPolicyButton from "./add-retention-policy-button";
import RetentionPolicyTableActions from "./retention-policy-table-actions";

export type RetentionPolicy = {
  id: string;
  clinicId: string;
  dataType: string;
  retentionDays: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const columns: ColumnDef<RetentionPolicy>[] = [
  {
    id: "dataType",
    accessorKey: "dataType",
    header: "Tipo de Dado",
  },
  {
    id: "retentionDays",
    accessorKey: "retentionDays",
    header: "Periodo de Retencao",
    cell: (params) => {
      const policy = params.row.original;
      return `${policy.retentionDays} dias`;
    },
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Descricao",
    cell: (params) => {
      const policy = params.row.original;
      return policy.description || "-";
    },
  },
  {
    id: "isActive",
    header: "Status",
    cell: (params) => {
      const policy = params.row.original;
      return policy.isActive ? (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200"
        >
          Ativo
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-200"
        >
          Inativo
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const policy = params.row.original;
      return <RetentionPolicyTableActions policy={policy} />;
    },
  },
];

interface RetentionPoliciesViewProps {
  data: RetentionPolicy[];
}

const RetentionPoliciesView = ({ data }: RetentionPoliciesViewProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddRetentionPolicyButton />
      </div>
      <DataTable data={data} columns={columns} />
    </div>
  );
};

export default RetentionPoliciesView;
