"use client";

import dayjs from "dayjs";
import { CalendarIcon, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const periods = [
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "7d" },
  { label: "14 dias", value: "14d" },
  { label: "Este mês", value: "month" },
  { label: "30 dias", value: "30d" },
  { label: "90 dias", value: "90d" },
];

function getDateRange(period: string) {
  const today = dayjs();
  switch (period) {
    case "today":
      return { from: today.format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
    case "7d":
      return { from: today.subtract(7, "day").format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
    case "14d":
      return { from: today.subtract(14, "day").format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
    case "month":
      return { from: today.startOf("month").format("YYYY-MM-DD"), to: today.endOf("month").format("YYYY-MM-DD") };
    case "30d":
      return { from: today.subtract(30, "day").format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
    case "90d":
      return { from: today.subtract(90, "day").format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
    default:
      return { from: today.startOf("month").format("YYYY-MM-DD"), to: today.endOf("month").format("YYYY-MM-DD") };
  }
}

function getActivePeriod(from?: string | null, to?: string | null): string {
  if (!from) return "month";
  const today = dayjs();
  const fromDate = dayjs(from);
  const toDate = to ? dayjs(to) : today;

  if (fromDate.isSame(today, "day") && toDate.isSame(today, "day")) return "today";

  const diff = toDate.diff(fromDate, "day");
  if (toDate.isSame(today, "day")) {
    if (diff === 7) return "7d";
    if (diff === 14) return "14d";
    if (diff === 30) return "30d";
    if (diff === 90) return "90d";
  }

  if (
    fromDate.isSame(today.startOf("month"), "day") &&
    toDate.isSame(today.endOf("month"), "day")
  ) return "month";

  return "";
}

function getActiveLabel(period: string, from?: string | null, to?: string | null): string {
  const found = periods.find((p) => p.value === period);
  if (found) return found.label;
  if (from && to) return `${dayjs(from).format("DD/MM")} — ${dayjs(to).format("DD/MM")}`;
  return "Período";
}

export function DatePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFrom = searchParams.get("from");
  const currentTo = searchParams.get("to");
  const activePeriod = getActivePeriod(currentFrom, currentTo);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const navigate = (from: string, to: string) => {
    router.push(`/dashboard?from=${from}&to=${to}`);
  };

  const handlePeriod = (period: string) => {
    const { from, to } = getDateRange(period);
    navigate(from, to);
  };

  const handleDateRange = (range: DateRange | undefined) => {
    if (range?.from) {
      const from = dayjs(range.from).format("YYYY-MM-DD");
      const to = range.to ? dayjs(range.to).format("YYYY-MM-DD") : from;
      navigate(from, to);
      if (range.to) setCalendarOpen(false);
    }
  };

  const calendarDefault: DateRange | undefined = currentFrom
    ? {
        from: new Date(currentFrom + "T12:00:00"),
        to: currentTo ? new Date(currentTo + "T12:00:00") : undefined,
      }
    : undefined;

  const activeLabel = getActiveLabel(activePeriod, currentFrom, currentTo);

  return (
    <div className="flex items-center gap-1.5">
      {/* Period label */}
      <span className="text-xs text-white/50 hidden sm:inline">{activeLabel}</span>

      {/* Filter dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-8 items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3 text-xs font-medium text-white/80 transition-all hover:bg-white/15 hover:text-white outline-none">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filtrar</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {periods.map((p) => (
            <DropdownMenuItem
              key={p.value}
              onClick={() => handlePeriod(p.value)}
              className={activePeriod === p.value ? "bg-primary/10 text-primary font-semibold" : ""}
            >
              {activePeriod === p.value && (
                <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
              {p.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCalendarOpen(true)}>
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            Personalizado
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Calendar popover (separate from dropdown) */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <span />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={calendarDefault}
            onSelect={handleDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
