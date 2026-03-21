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

interface DailyLead {
  date: string;
  count: number;
}

interface DailyLeadsChartProps {
  data: DailyLead[];
  from: string;
  to: string;
}

const DailyLeadsChart = ({ data, from, to }: DailyLeadsChartProps) => {
  const startDate = dayjs(from);
  const endDate = dayjs(to);
  const totalDays = endDate.diff(startDate, "day") + 1;

  const chartData = Array.from({ length: totalDays }).map((_, i) => {
    const date = startDate.add(i, "day").format("YYYY-MM-DD");
    const dataForDay = data.find((item) => item.date === date);
    return {
      date: dayjs(date).format("DD/MM"),
      fullDate: date,
      leads: Number(dataForDay?.count || 0),
    };
  });

  const chartConfig = {
    leads: {
      label: "Leads",
      color: "#D08C32",
    },
  } satisfies ChartConfig;

  const totalLeads = chartData.reduce((sum, d) => sum + d.leads, 0);

  return (
    <Card className="hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
          <TrendingUp className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1">
          <CardTitle>Leads Diários</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            {totalLeads} leads no período
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Nenhum dado no período
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[200px]">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D08C32" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#D08C32" stopOpacity={0} />
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
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                allowDecimals={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <>
                        <div className="h-3 w-3 rounded bg-amber-500" />
                        <span className="text-muted-foreground">Leads:</span>
                        <span className="font-semibold">{value}</span>
                      </>
                    )}
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
                type="monotone"
                dataKey="leads"
                stroke="#D08C32"
                fill="url(#fillLeads)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyLeadsChart;
