"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import {
  Ban,
  CalendarDays,
  ClipboardList,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  appointmentRemindersTable,
  appointmentsTable,
  doctorsTable,
  patientsTable,
} from "@/db/schema";

dayjs.locale("pt-br");

type Appointment = typeof appointmentsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect;
  doctor: typeof doctorsTable.$inferSelect;
};

type Reminder = typeof appointmentRemindersTable.$inferSelect;

interface AgendaSidebarProps {
  appointments: Appointment[];
  reminders: Reminder[];
}

const AgendaSidebar = ({ appointments, reminders }: AgendaSidebarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const todayAppointments = useMemo(() => {
    const today = dayjs();
    return appointments.filter(
      (a) =>
        dayjs(a.date).isSame(today, "day") && a.status !== "cancelled",
    );
  }, [appointments]);

  const pendingReminders = useMemo(() => {
    return reminders.filter((r) => r.status === "pending");
  }, [reminders]);

  const selectedDateAppointments = useMemo(() => {
    if (!selectedDate) return [];
    const selected = dayjs(selectedDate);
    return appointments.filter(
      (a) =>
        dayjs(a.date).isSame(selected, "day") && a.status !== "cancelled",
    );
  }, [appointments, selectedDate]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Resumo do dia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <CalendarDays className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayAppointments.length}</p>
              <p className="text-xs text-muted-foreground">
                Procedimentos hoje
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingReminders.length}</p>
              <p className="text-xs text-muted-foreground">
                Lembretes pendentes
              </p>
            </div>
          </div>

          {selectedDate && !dayjs(selectedDate).isSame(dayjs(), "day") && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">
                  {dayjs(selectedDate).format("DD/MM/YYYY")}
                </p>
                <p className="text-sm font-medium">
                  {selectedDateAppointments.length} procedimento(s)
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Acoes rapidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/agenda/bloqueios">
              <Ban className="mr-2 h-4 w-4" />
              Bloquear Horario
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/agenda/lista-espera">
              <ClipboardList className="mr-2 h-4 w-4" />
              Lista de Espera
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaSidebar;
