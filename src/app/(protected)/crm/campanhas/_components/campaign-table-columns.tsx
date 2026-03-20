"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

import { Badge } from "@/components/ui/badge";
import { campaignsTable } from "@/db/schema";

import CampaignTableActions from "./campaign-table-actions";

const typeLabels: Record<string, string> = {
  birthday: "Aniversario",
  inactive: "Pacientes Inativos",
  follow_up: "Acompanhamento",
  promotional: "Promocional",
  custom: "Personalizada",
};

const typeBadgeClasses: Record<string, string> = {
  birthday: "bg-pink-100 text-pink-800 border-pink-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
  follow_up: "bg-blue-100 text-blue-800 border-blue-200",
  promotional: "bg-amber-100 text-amber-800 border-amber-200",
  custom: "bg-orange-100 text-orange-800 border-orange-200",
};

const channelLabels: Record<string, string> = {
  email: "E-mail",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

const channelBadgeClasses: Record<string, string> = {
  email: "bg-blue-100 text-blue-800 border-blue-200",
  sms: "bg-green-100 text-green-800 border-green-200",
  whatsapp: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendada",
  sending: "Enviando",
  sent: "Enviada",
  cancelled: "Cancelada",
};

const statusBadgeClasses: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  sending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  sent: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export type Campaign = typeof campaignsTable.$inferSelect;

export const createCampaignColumns = (): ColumnDef<Campaign>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "type",
    accessorKey: "type",
    header: "Tipo",
    cell: (params) => {
      const campaign = params.row.original;
      const color = typeBadgeClasses[campaign.type] ?? "";
      return (
        <Badge variant="outline" className={color}>
          {typeLabels[campaign.type] ?? campaign.type}
        </Badge>
      );
    },
  },
  {
    id: "channel",
    accessorKey: "channel",
    header: "Canal",
    cell: (params) => {
      const campaign = params.row.original;
      const color = channelBadgeClasses[campaign.channel] ?? "";
      return (
        <Badge variant="outline" className={color}>
          {channelLabels[campaign.channel] ?? campaign.channel}
        </Badge>
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: (params) => {
      const campaign = params.row.original;
      const color = statusBadgeClasses[campaign.status] ?? "";
      return (
        <Badge variant="outline" className={color}>
          {statusLabels[campaign.status] ?? campaign.status}
        </Badge>
      );
    },
  },
  {
    id: "recipientCount",
    accessorKey: "recipientCount",
    header: "Destinatarios",
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Criada em",
    cell: (params) => {
      const campaign = params.row.original;
      return dayjs(campaign.createdAt).format("DD/MM/YYYY");
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const campaign = params.row.original;
      return <CampaignTableActions campaign={campaign} />;
    },
  },
];
