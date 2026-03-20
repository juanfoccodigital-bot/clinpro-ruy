"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import { Clock } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyInCents } from "@/helpers/currency";

dayjs.locale("pt-br");

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Agendado", color: "#D4A017" },
  confirmed: { label: "Confirmado", color: "#C49A00" },
  arrived: { label: "Chegou", color: "#E6B422" },
  in_service: { label: "Em Atendimento", color: "#818CF8" },
  completed: { label: "Completado", color: "#B8860B" },
  cancelled: { label: "Cancelado", color: "#EF4444" },
  no_show: { label: "Faltou", color: "#F97316" },
};

interface Appointment {
  id: string;
  date: Date;
  patient: { name: string };
  doctor: { name: string };
  status: string;
  appointmentPriceInCents: number;
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

const UpcomingAppointments = ({ appointments }: UpcomingAppointmentsProps) => {
  const visibleAppointments = appointments.slice(0, 10);

  return (
    <Card className="hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-600/10">
          <Clock className="h-4 w-4 text-yellow-700" />
        </div>
        <CardTitle>Próximos Procedimentos</CardTitle>
      </CardHeader>
      <CardContent>
        {visibleAppointments.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Nenhum agendamento futuro
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleAppointments.map((appointment) => {
              const config = statusConfig[appointment.status];
              const label = config?.label ?? appointment.status;
              const color = config?.color ?? "#94A3B8";

              return (
                <div
                  key={appointment.id}
                  className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/50"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {appointment.patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {appointment.patient.name}
                      </p>
                      <Badge
                        variant="outline"
                        className="shrink-0"
                        style={{
                          backgroundColor: `${color}15`,
                          color: color,
                          borderColor: `${color}30`,
                        }}
                      >
                        {label}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{dayjs(appointment.date).format("DD/MM HH:mm")}</span>
                      <span>·</span>
                      <span className="truncate">{appointment.doctor.name}</span>
                      <span className="ml-auto font-medium tabular-nums text-foreground">
                        {formatCurrencyInCents(appointment.appointmentPriceInCents)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingAppointments;
