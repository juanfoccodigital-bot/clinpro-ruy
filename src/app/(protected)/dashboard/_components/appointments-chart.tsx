"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";

dayjs.locale("pt-br");
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrencyInCents } from "@/helpers/currency";

interface DailyAppointment {
  date: string;
  appointments: number;
  revenue: number | null;
}

interface AppointmentsChartProps {
  dailyAppointmentsData: DailyAppointment[];
}

const AppointmentsChart = ({
  dailyAppointmentsData,
}: AppointmentsChartProps) => {
  const chartDays = Array.from({ length: 21 }).map((_, i) =>
    dayjs()
      .subtract(10 - i, "days")
      .format("YYYY-MM-DD"),
  );

  const chartData = chartDays.map((date) => {
    const dataForDay = dailyAppointmentsData.find((item) => item.date === date);
    return {
      date: dayjs(date).format("DD/MM"),
      fullDate: date,
      appointments: dataForDay?.appointments || 0,
      revenue: Number(dataForDay?.revenue || 0),
    };
  });

  const chartConfig = {
    appointments: {
      label: "Procedimentos",
      color: "#D4A017",
    },
    revenue: {
      label: "Faturamento",
      color: "#C49A00",
    },
  } satisfies ChartConfig;

  return (
    <Card className="hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
          <TrendingUp className="h-4 w-4 text-amber-600" />
        </div>
        <CardTitle>Procedimentos e Faturamento</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px]">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="fillAppointments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4A017" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#D4A017" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C49A00" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#C49A00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              tickFormatter={(value) => formatCurrencyInCents(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "revenue") {
                      return (
                        <>
                          <div className="h-3 w-3 rounded bg-yellow-600" />
                          <span className="text-muted-foreground">
                            Faturamento:
                          </span>
                          <span className="font-semibold">
                            {formatCurrencyInCents(Number(value))}
                          </span>
                        </>
                      );
                    }
                    return (
                      <>
                        <div className="h-3 w-3 rounded bg-amber-500" />
                        <span className="text-muted-foreground">
                          Procedimentos:
                        </span>
                        <span className="font-semibold">{value}</span>
                      </>
                    );
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return dayjs(payload[0].payload?.fullDate).format(
                        "DD/MM/YYYY (dddd)",
                      );
                    }
                    return label;
                  }}
                />
              }
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="appointments"
              stroke="#D4A017"
              fill="url(#fillAppointments)"
              strokeWidth={2.5}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#C49A00"
              fill="url(#fillRevenue)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default AppointmentsChart;
