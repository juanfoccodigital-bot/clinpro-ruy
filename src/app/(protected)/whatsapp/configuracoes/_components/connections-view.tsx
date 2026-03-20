"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";

import ConnectionsTableActions from "./connections-table-actions";

export type WhatsappConnection = {
  id: string;
  clinicId: string;
  instanceName: string;
  apiUrl: string;
  apiKey: string;
  phoneNumber: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "connected":
      return (
        <Badge
          variant="outline"
          className="border-green-200 bg-green-100 text-green-800"
        >
          Conectado
        </Badge>
      );
    case "disconnected":
      return (
        <Badge
          variant="outline"
          className="border-red-200 bg-red-100 text-red-800"
        >
          Desconectado
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="border-yellow-200 bg-yellow-100 text-yellow-800"
        >
          Pendente
        </Badge>
      );
  }
};

const columns: ColumnDef<WhatsappConnection>[] = [
  {
    id: "instanceName",
    accessorKey: "instanceName",
    header: "Instancia",
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Telefone",
    cell: (params) => {
      const connection = params.row.original;
      return connection.phoneNumber || "-";
    },
  },
  {
    id: "status",
    header: "Status",
    cell: (params) => {
      const connection = params.row.original;
      return getStatusBadge(connection.status);
    },
  },
  {
    id: "apiUrl",
    accessorKey: "apiUrl",
    header: "URL da API",
    cell: (params) => {
      const connection = params.row.original;
      return (
        <span className="max-w-[200px] truncate text-xs">
          {connection.apiUrl}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const connection = params.row.original;
      return <ConnectionsTableActions connection={connection} />;
    },
  },
];

interface ConnectionsViewProps {
  data: WhatsappConnection[];
}

const ConnectionsView = ({ data }: ConnectionsViewProps) => {
  return (
    <div className="space-y-4">
      <DataTable data={data} columns={columns} />
    </div>
  );
};

export default ConnectionsView;
