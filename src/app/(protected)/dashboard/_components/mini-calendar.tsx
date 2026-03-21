"use client";

import { ptBR } from "date-fns/locale";
import { CalendarDays, CalendarRange } from "lucide-react";
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
    <Card className="shadow-luxury transition-shadow duration-300 hover:shadow-luxury-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D08C32]/15 to-[#D3AB32]/10">
          <CalendarRange className="h-4 w-4 text-[#D08C32]" />
        </div>
        <div>
          <CardTitle>Calendario</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Dias com agendamentos</p>
        </div>
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
          <div className="mt-3 w-full rounded-2xl bg-gradient-to-r from-[#D08C32]/6 to-[#D3AB32]/4 border border-[#D08C32]/8 px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#D08C32]" />
              <span className="text-3xl font-extrabold text-[#261C10] dark:text-white">{selectedDateAppointments}</span>
              <span className="text-muted-foreground text-xs">
                agendamento{selectedDateAppointments !== 1 ? "s" : ""} em{" "}
                {selectedDate.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MiniCalendar;
