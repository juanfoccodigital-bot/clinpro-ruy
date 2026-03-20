"use client";

import { PieChartIcon } from "lucide-react";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AppointmentsStatusChartProps {
  data: { status: string; total: number }[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Agendado", color: "#D4A017" },
  confirmed: { label: "Confirmado", color: "#C49A00" },
  arrived: { label: "Chegou", color: "#E6B422" },
  in_service: { label: "Em Atendimento", color: "#818CF8" },
  completed: { label: "Completado", color: "#B8860B" },
  cancelled: { label: "Cancelado", color: "#EF4444" },
  no_show: { label: "Faltou", color: "#F97316" },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: { status: string; total: number } }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const { status, total } = payload[0].payload;
  const config = statusConfig[status];
  const label = config?.label ?? status;
  const color = config?.color ?? "#94A3B8";

  return (
    <div className="rounded-xl border bg-background px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        {total} agendamento{total !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

const AppointmentsStatusChart = ({ data }: AppointmentsStatusChartProps) => {
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.total, 0),
    [data],
  );

  const chartData = useMemo(
    () =>
      data
        .filter((item) => item.total > 0)
        .map((item) => ({
          ...item,
          label: statusConfig[item.status]?.label ?? item.status,
          color: statusConfig[item.status]?.color ?? "#94A3B8",
        })),
    [data],
  );

  return (
    <Card className="hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
          <PieChartIcon className="h-4 w-4 text-amber-600" />
        </div>
        <CardTitle>Status dos Procedimentos</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Nenhum agendamento no período
            </p>
          </div>
        ) : (
          <>
            <div className="relative mx-auto h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="total"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                    strokeWidth={0}
                    cornerRadius={4}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{total}</span>
                <span className="text-muted-foreground text-xs">Total</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {chartData.map((entry) => (
                <div
                  key={entry.status}
                  className="flex items-center gap-2 rounded-lg p-1.5 text-sm transition-colors hover:bg-muted/50"
                >
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground text-xs">
                    {entry.label}
                  </span>
                  <span className="ml-auto text-xs font-semibold tabular-nums">
                    {entry.total}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsStatusChart;
