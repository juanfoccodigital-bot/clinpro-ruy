"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  appointmentsTable,
  doctorScheduleBlocksTable,
  doctorsTable,
  patientsTable,
} from "@/db/schema";

dayjs.locale("pt-br");

type Appointment = typeof appointmentsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect;
  doctor: typeof doctorsTable.$inferSelect;
};

type ScheduleBlock = typeof doctorScheduleBlocksTable.$inferSelect;

interface CalendarViewProps {
  appointments: Appointment[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  patients: (typeof patientsTable.$inferSelect)[];
  scheduleBlocks: ScheduleBlock[];
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8:00 - 18:00
const WEEK_DAYS = [
  "Segunda",
  "Terca",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sabado",
  "Domingo",
];

const DOCTOR_COLORS = [
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-green-100 border-green-300 text-green-800",
  "bg-amber-100 border-amber-300 text-amber-800",
  "bg-orange-100 border-orange-300 text-orange-800",
  "bg-pink-100 border-pink-300 text-pink-800",
  "bg-teal-100 border-teal-300 text-teal-800",
  "bg-amber-100 border-amber-300 text-amber-800",
  "bg-rose-100 border-rose-300 text-rose-800",
];

const statusLabels: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  arrived: "Chegou",
  in_service: "Em atendimento",
  completed: "Concluido",
  cancelled: "Cancelado",
  no_show: "Nao compareceu",
};

const CalendarView = ({
  appointments,
  doctors,
  scheduleBlocks,
}: CalendarViewProps) => {
  const [weekStart, setWeekStart] = useState(() => {
    return dayjs().startOf("week").add(1, "day"); // Monday
  });
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>([]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));
  }, [weekStart]);

  const filteredAppointments = useMemo(() => {
    if (selectedDoctorIds.length === 0) return appointments;
    return appointments.filter((a) => selectedDoctorIds.includes(a.doctorId));
  }, [appointments, selectedDoctorIds]);

  const filteredBlocks = useMemo(() => {
    if (selectedDoctorIds.length === 0) return scheduleBlocks;
    return scheduleBlocks.filter((b) =>
      selectedDoctorIds.includes(b.doctorId),
    );
  }, [scheduleBlocks, selectedDoctorIds]);

  const doctorColorMap = useMemo(() => {
    const map = new Map<string, string>();
    doctors.forEach((doc, i) => {
      map.set(doc.id, DOCTOR_COLORS[i % DOCTOR_COLORS.length]);
    });
    return map;
  }, [doctors]);

  const getAppointmentsForSlot = (day: dayjs.Dayjs, hour: number) => {
    return filteredAppointments.filter((a) => {
      const aDate = dayjs(a.date);
      return (
        aDate.isSame(day, "day") &&
        aDate.hour() === hour
      );
    });
  };

  const isBlockedSlot = (day: dayjs.Dayjs, hour: number) => {
    return filteredBlocks.some((block) => {
      const start = dayjs(block.startDate);
      const end = dayjs(block.endDate);
      const slotStart = day.hour(hour).minute(0).second(0);
      const slotEnd = slotStart.add(1, "hour");
      return slotStart.isBefore(end) && slotEnd.isAfter(start);
    });
  };

  const getBlockForSlot = (day: dayjs.Dayjs, hour: number) => {
    return filteredBlocks.find((block) => {
      const start = dayjs(block.startDate);
      const end = dayjs(block.endDate);
      const slotStart = day.hour(hour).minute(0).second(0);
      const slotEnd = slotStart.add(1, "hour");
      return slotStart.isBefore(end) && slotEnd.isAfter(start);
    });
  };

  const goToPrevWeek = () => setWeekStart((prev) => prev.subtract(7, "day"));
  const goToNextWeek = () => setWeekStart((prev) => prev.add(7, "day"));
  const goToToday = () => setWeekStart(dayjs().startOf("week").add(1, "day"));

  const isToday = (day: dayjs.Dayjs) => day.isSame(dayjs(), "day");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-sm font-medium">
            {weekStart.format("DD MMM")} -{" "}
            {weekStart.add(6, "day").format("DD MMM YYYY")}
          </span>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border">
        <div className="min-w-[900px]">
          {/* Header with days */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b bg-muted/50">
            <div className="border-r p-2 text-center text-xs font-medium text-muted-foreground">
              Horario
            </div>
            {weekDays.map((day, i) => (
              <div
                key={i}
                className={`border-r p-2 text-center last:border-r-0 ${
                  isToday(day) ? "bg-primary/10" : ""
                }`}
              >
                <div className="text-xs font-medium text-muted-foreground">
                  {WEEK_DAYS[i]}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    isToday(day)
                      ? "flex h-7 w-7 mx-auto items-center justify-center rounded-full bg-primary text-primary-foreground"
                      : ""
                  }`}
                >
                  {day.format("DD")}
                </div>
              </div>
            ))}
          </div>

          {/* Time grid */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[80px_repeat(7,1fr)] border-b last:border-b-0"
            >
              <div className="flex items-start justify-center border-r p-2 text-xs text-muted-foreground">
                {String(hour).padStart(2, "0")}:00
              </div>
              {weekDays.map((day, dayIdx) => {
                const slotAppointments = getAppointmentsForSlot(day, hour);
                const blocked = isBlockedSlot(day, hour);
                const block = getBlockForSlot(day, hour);

                return (
                  <div
                    key={dayIdx}
                    className={`relative min-h-[60px] border-r p-1 last:border-r-0 ${
                      blocked
                        ? "bg-gray-100 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.05)_5px,rgba(0,0,0,0.05)_10px)]"
                        : isToday(day)
                          ? "bg-primary/5"
                          : ""
                    }`}
                  >
                    {blocked && block && (
                      <div className="mb-1 truncate rounded bg-gray-200 px-1 py-0.5 text-[10px] font-medium text-gray-600">
                        {block.title}
                      </div>
                    )}
                    {slotAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={`mb-1 rounded border px-1.5 py-1 text-[11px] leading-tight ${
                          apt.status === "cancelled"
                            ? "border-red-200 bg-red-50 text-red-700 line-through"
                            : doctorColorMap.get(apt.doctorId) ??
                              "bg-blue-100 border-blue-300 text-blue-800"
                        }`}
                      >
                        <div className="truncate font-medium">
                          {apt.patient.name}
                        </div>
                        <Badge
                          variant="outline"
                          className="mt-0.5 h-4 px-1 text-[9px]"
                        >
                          {statusLabels[apt.status] ?? apt.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
