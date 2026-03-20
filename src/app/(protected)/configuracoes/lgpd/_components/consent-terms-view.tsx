"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";

import AddConsentTermButton from "./add-consent-term-button";
import ConsentTableActions from "./consent-table-actions";

export type ConsentTerm = {
  id: string;
  clinicId: string;
  patientId: string;
  type: string;
  version: string;
  accepted: boolean;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  patient: { id: string; name: string };
};

const typeLabels: Record<string, string> = {
  treatment: "Tratamento",
  data_sharing: "Compartilhamento",
  marketing: "Marketing",
  research: "Pesquisa",
  terms_of_use: "Termos de Uso",
  privacy_policy: "Politica de Privacidade",
};

const getStatusBadge = (term: ConsentTerm) => {
  if (term.accepted) {
    return (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 border-green-200"
      >
        Aceito
      </Badge>
    );
  }
  if (term.revokedAt) {
    return (
      <Badge
        variant="outline"
        className="bg-red-100 text-red-800 border-red-200"
      >
        Revogado
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-yellow-100 text-yellow-800 border-yellow-200"
    >
      Pendente
    </Badge>
  );
};

const columns: ColumnDef<ConsentTerm>[] = [
  {
    id: "patient",
    header: "Paciente",
    cell: (params) => {
      const term = params.row.original;
      return term.patient.name;
    },
  },
  {
    id: "type",
    accessorKey: "type",
    header: "Tipo",
    cell: (params) => {
      const term = params.row.original;
      return typeLabels[term.type] ?? term.type;
    },
  },
  {
    id: "version",
    accessorKey: "version",
    header: "Versao",
  },
  {
    id: "status",
    header: "Status",
    cell: (params) => {
      const term = params.row.original;
      return getStatusBadge(term);
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Data",
    cell: (params) => {
      const term = params.row.original;
      return dayjs(term.createdAt).format("DD/MM/YYYY");
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const term = params.row.original;
      return <ConsentTableActions consentTerm={term} />;
    },
  },
];

interface ConsentTermsViewProps {
  data: ConsentTerm[];
}

const ConsentTermsView = ({ data }: ConsentTermsViewProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddConsentTermButton />
      </div>
      <DataTable data={data} columns={columns} />
    </div>
  );
};

export default ConsentTermsView;
