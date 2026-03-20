"use client";

import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const periods = [
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "7d" },
  { label: "14 dias", value: "14d" },
  { label: "30 dias", value: "30d" },
  { label: "Este mês", value: "month" },
  { label: "Mês passado", value: "last_month" },
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
    case "30d":
      return { from: today.subtract(30, "day").format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
    case "month":
      return { from: today.startOf("month").format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
    case "last_month":
      return {
        from: today.subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
        to: today.subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
      };
    case "90d":
      return { from: today.subtract(90, "day").format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
    default:
      return { from: today.startOf("month").format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
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
    if (fromDate.isSame(today.startOf("month"), "day")) return "month";
  }

  if (
    fromDate.isSame(today.subtract(1, "month").startOf("month"), "day") &&
    toDate.isSame(today.subtract(1, "month").endOf("month"), "day")
  ) return "last_month";

  return "";
}

export default function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFrom = searchParams.get("from");
  const currentTo = searchParams.get("to");
  const activePeriod = getActivePeriod(currentFrom, currentTo);
  const [open, setOpen] = useState(false);

  const navigate = (from: string, to: string) => {
    router.push(`/marketing/trafego?from=${from}&to=${to}`);
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
      if (range.to) setOpen(false);
    }
  };

  const calendarDefault: DateRange | undefined = currentFrom
    ? {
        from: new Date(currentFrom + "T12:00:00"),
        to: currentTo ? new Date(currentTo + "T12:00:00") : undefined,
      }
    : undefined;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => handlePeriod(p.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            activePeriod === p.value
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-amber-100 hover:text-amber-700"
          }`}
        >
          {p.label}
        </button>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={activePeriod === "" ? "default" : "outline"}
            size="sm"
            className={`h-7 gap-1.5 rounded-full text-xs ${
              activePeriod === ""
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : ""
            }`}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            Personalizado
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={calendarDefault}
            onSelect={handleDateRange}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
