"use client";

import { ptBR } from "date-fns/locale";
import { CalendarRange } from "lucide-react";
import { useMemo, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AppointmentDate {
  date: string;
  total: number;
}

interface MiniCalendarProps {
  appointmentDates: AppointmentDate[];
}

const MiniCalendar = ({ appointmentDates }: MiniCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const datesWithAppointments = useMemo(
    () =>
      appointmentDates
        .filter((item) => item.total > 0)
        .map((item) => new Date(item.date + "T00:00:00")),
    [appointmentDates],
  );

  const selectedDateString = useMemo(() => {
    if (!selectedDate) return null;
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  const selectedDateAppointments = useMemo(() => {
    if (!selectedDateString) return 0;
    const found = appointmentDates.find(
      (item) => item.date === selectedDateString,
    );
    return found?.total ?? 0;
  }, [selectedDateString, appointmentDates]);

  return (
    <Card className="hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <CalendarRange className="text-primary h-4 w-4" />
        </div>
        <CardTitle>Calendário</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={ptBR}
          modifiers={{
            hasAppointment: datesWithAppointments,
          }}
          modifiersStyles={{
            hasAppointment: {
              fontWeight: "bold",
              textDecoration: "underline",
              textDecorationColor: "#D08C32",
              textUnderlineOffset: "4px",
            },
          }}
        />
        {selectedDate && (
          <div className="mt-3 rounded-xl bg-muted/50 px-4 py-2.5 text-center">
            <p className="text-sm">
              <span className="text-2xl font-bold">{selectedDateAppointments}</span>
              <span className="text-muted-foreground ml-1.5 text-xs">
                agendamento{selectedDateAppointments !== 1 ? "s" : ""} em{" "}
                {selectedDate.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MiniCalendar;
