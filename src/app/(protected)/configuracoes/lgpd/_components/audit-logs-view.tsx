"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";

type AuditLog = {
  id: string;
  clinicId: string;
  userId: string | null;
  action: string;
  module: string;
  resourceId: string | null;
  resourceType: string | null;
  description: string | null;
  metadata: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user?: { id: string; name: string; email: string } | null;
};

const actionLabels: Record<string, string> = {
  create: "Criar",
  read: "Leitura",
  update: "Atualizar",
  delete: "Excluir",
  login: "Login",
  logout: "Logout",
  export: "Exportar",
  print: "Imprimir",
};

const actionBadgeClasses: Record<string, string> = {
  create: "bg-green-100 text-green-800 border-green-200",
  read: "bg-blue-100 text-blue-800 border-blue-200",
  update: "bg-yellow-100 text-yellow-800 border-yellow-200",
  delete: "bg-red-100 text-red-800 border-red-200",
  login: "bg-amber-100 text-amber-800 border-amber-200",
  logout: "bg-gray-100 text-gray-800 border-gray-200",
  export: "bg-amber-100 text-amber-800 border-amber-200",
  print: "bg-cyan-100 text-cyan-800 border-cyan-200",
};

const columns: ColumnDef<AuditLog>[] = [
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Data/Hora",
    cell: (params) => {
      const log = params.row.original;
      return dayjs(log.createdAt).format("DD/MM/YYYY HH:mm");
    },
  },
  {
    id: "user",
    header: "Usuario",
    cell: (params) => {
      const log = params.row.original;
      return log.user?.name || log.user?.email || "Sistema";
    },
  },
  {
    id: "action",
    accessorKey: "action",
    header: "Acao",
    cell: (params) => {
      const log = params.row.original;
      const color = actionBadgeClasses[log.action] ?? "";
      return (
        <Badge variant="outline" className={color}>
          {actionLabels[log.action] ?? log.action}
        </Badge>
      );
    },
  },
  {
    id: "module",
    accessorKey: "module",
    header: "Modulo",
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Descricao",
    cell: (params) => {
      const log = params.row.original;
      return log.description || "-";
    },
  },
  {
    id: "ipAddress",
    accessorKey: "ipAddress",
    header: "IP",
    cell: (params) => {
      const log = params.row.original;
      return log.ipAddress || "-";
    },
  },
];

interface AuditLogsViewProps {
  data: AuditLog[];
}

const AuditLogsView = ({ data }: AuditLogsViewProps) => {
  return <DataTable data={data} columns={columns} />;
};

export default AuditLogsView;
