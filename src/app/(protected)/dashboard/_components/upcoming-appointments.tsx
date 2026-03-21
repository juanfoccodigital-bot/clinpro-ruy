"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import { CalendarDays, Clock } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyInCents } from "@/helpers/currency";

dayjs.locale("pt-br");

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Agendado", color: "#D08C32" },
  confirmed: { label: "Confirmado", color: "#D3AB32" },
  arrived: { label: "Chegou", color: "#C9952E" },
  in_service: { label: "Em Atendimento", color: "#8B6914" },
  completed: { label: "Completado", color: "#B8860B" },
  cancelled: { label: "Cancelado", color: "#C0392B" },
  no_show: { label: "Faltou", color: "#E67E22" },
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
    <Card className="shadow-luxury transition-shadow duration-300 hover:shadow-luxury-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D3AB32]/15 to-[#D08C32]/10">
          <Clock className="h-4 w-4 text-[#D08C32]" />
        </div>
        <div>
          <CardTitle>Proximos Procedimentos</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Agenda futura</p>
        </div>
      </CardHeader>
      <CardContent>
        {visibleAppointments.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#D08C32]/5">
                <CalendarDays className="h-5 w-5 text-[#D08C32]/40" />
              </div>
              <p className="text-muted-foreground text-sm">
                Nenhum agendamento futuro
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {visibleAppointments.map((appointment, index) => {
              const config = statusConfig[appointment.status];
              const label = config?.label ?? appointment.status;
              const color = config?.color ?? "#94A3B8";

              return (
                <div
                  key={appointment.id}
                  className="flex items-center gap-3 rounded-2xl p-3 transition-all duration-200 hover:bg-[#D08C32]/3 hover:shadow-sm"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Avatar className="h-10 w-10 shrink-0 ring-2 ring-[#D08C32]/10">
                    <AvatarFallback className="bg-gradient-to-br from-[#D08C32]/10 to-[#D3AB32]/10 text-[#D08C32] text-xs font-bold">
                      {appointment.patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-[#261C10] dark:text-white">
                        {appointment.patient.name}
                      </p>
                      <Badge
                        variant="outline"
                        className="shrink-0 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${color}12`,
                          color: color,
                          borderColor: `${color}25`,
                        }}
                      >
                        {label}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {dayjs(appointment.date).format("DD/MM HH:mm")}
                      </span>
                      <span className="text-[#D08C32]/30">|</span>
                      <span className="truncate">{appointment.doctor.name}</span>
                      <span className="ml-auto font-semibold tabular-nums text-[#D08C32]">
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
