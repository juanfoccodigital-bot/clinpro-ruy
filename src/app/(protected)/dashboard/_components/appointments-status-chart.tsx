"use client";

import { PieChartIcon } from "lucide-react";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AppointmentsStatusChartProps {
  data: { status: string; total: number }[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Agendado", color: "#D08C32" },
  confirmed: { label: "Confirmado", color: "#D3AB32" },
  arrived: { label: "Chegou", color: "#C9952E" },
  in_service: { label: "Em Atendimento", color: "#8B6914" },
  completed: { label: "Completado", color: "#B8860B" },
  cancelled: { label: "Cancelado", color: "#C0392B" },
  no_show: { label: "Faltou", color: "#E67E22" },
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
    <div className="rounded-2xl border border-[#D08C32]/10 bg-white/95 px-4 py-3 shadow-luxury-lg backdrop-blur-sm dark:bg-[#261C10]/95">
      <div className="flex items-center gap-2.5">
        <div
          className="h-3 w-3 rounded-full ring-2 ring-offset-1"
          style={{ backgroundColor: color, boxShadow: `0 0 0 2px ${color}40` }}
        />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="text-muted-foreground mt-1.5 text-sm">
        <span className="font-bold text-foreground">{total}</span> agendamento{total !== 1 ? "s" : ""}
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
    <Card className="shadow-luxury transition-shadow duration-300 hover:shadow-luxury-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D08C32]/15 to-[#D3AB32]/10">
          <PieChartIcon className="h-4 w-4 text-[#D08C32]" />
        </div>
        <div>
          <CardTitle>Status dos Procedimentos</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Distribuicao por status</p>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#D08C32]/5">
                <PieChartIcon className="h-5 w-5 text-[#D08C32]/40" />
              </div>
              <p className="text-muted-foreground text-sm">
                Nenhum agendamento no periodo
              </p>
            </div>
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
                <span className="text-4xl font-extrabold text-[#261C10] dark:text-white">{total}</span>
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Total</span>
              </div>
            </div>

            <div className="divider-gold my-4" />

            <div className="grid grid-cols-2 gap-1.5">
              {chartData.map((entry) => (
                <div
                  key={entry.status}
                  className="flex items-center gap-2 rounded-xl p-2 text-sm transition-colors hover:bg-[#D08C32]/5"
                >
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground text-xs">
                    {entry.label}
                  </span>
                  <span className="ml-auto text-xs font-bold tabular-nums">
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
