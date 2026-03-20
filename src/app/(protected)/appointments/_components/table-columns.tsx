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

const appointmentStatusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "outline",
  confirmed: "default",
  arrived: "secondary",
  in_service: "default",
  completed: "secondary",
  cancelled: "destructive",
  no_show: "destructive",
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
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Data e Hora",
    cell: (params) => {
      const appointment = params.row.original;
      return format(new Date(appointment.date), "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      });
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
        <Badge variant={appointmentStatusVariants[status] ?? "outline"}>
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
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(price);
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
