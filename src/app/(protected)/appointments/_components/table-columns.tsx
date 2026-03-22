"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { appointmentsTable } from "@/db/schema";

import AppointmentsTableActions from "./table-actions";

const appointmentStatusLabels: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  arrived: "Chegou",
  in_service: "Em Atendimento",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Não Compareceu",
};

const appointmentStatusStyles: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  arrived: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  in_service: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  no_show: "bg-red-500/10 text-red-600 border-red-500/20",
};

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    sex: "male" | "female";
  };
};

export const appointmentsTableColumns: ColumnDef<AppointmentWithRelations>[] = [
  {
    id: "patient",
    accessorKey: "patient.name",
    header: "Paciente",
    cell: (params) => {
      const appointment = params.row.original;
      return (
        <span className="font-medium">{appointment.patient.name}</span>
      );
    },
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Data e Hora",
    cell: (params) => {
      const appointment = params.row.original;
      const dateStr = format(new Date(appointment.date), "dd MMM yyyy", {
        locale: ptBR,
      });
      const timeStr = format(new Date(appointment.date), "HH:mm", {
        locale: ptBR,
      });
      return (
        <div>
          <span className="font-medium">{dateStr}</span>
          <span className="text-muted-foreground ml-1.5 text-xs">{timeStr}</span>
        </div>
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: (params) => {
      const appointment = params.row.original;
      const status = appointment.status ?? "scheduled";
      return (
        <Badge
          variant="outline"
          className={appointmentStatusStyles[status] ?? ""}
        >
          {appointmentStatusLabels[status] ?? status}
        </Badge>
      );
    },
  },
  {
    id: "price",
    accessorKey: "appointmentPriceInCents",
    header: "Valor",
    cell: (params) => {
      const appointment = params.row.original;
      const price = appointment.appointmentPriceInCents / 100;
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(price);
      return <span className="font-semibold">{formatted}</span>;
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const appointment = params.row.original;
      return <AppointmentsTableActions appointment={appointment} />;
    },
  },
];
