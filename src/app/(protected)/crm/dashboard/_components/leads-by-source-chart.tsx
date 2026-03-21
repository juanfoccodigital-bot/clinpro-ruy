"use client";

import { PieChartIcon } from "lucide-react";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeadsBySource {
  source: string | null;
  count: number;
}

interface LeadsBySourceChartProps {
  data: LeadsBySource[];
}

const sourceColors: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  google: "#4285F4",
  whatsapp: "#25D366",
  indicação: "#D08C32",
  indicacao: "#D08C32",
  site: "#6366F1",
  telefone: "#F59E0B",
  outros: "#94A3B8",
};

function getSourceLabel(source: string | null): string {
  if (!source) return "Não informado";
  const lower = source.toLowerCase();
  const labels: Record<string, string> = {
    facebook: "Facebook",
    instagram: "Instagram",
    google: "Google",
    whatsapp: "WhatsApp",
    indicação: "Indicação",
    indicacao: "Indicação",
    site: "Site",
    telefone: "Telefone",
  };
  return labels[lower] || source;
}

function getSourceColor(source: string | null): string {
  if (!source) return "#94A3B8";
  return sourceColors[source.toLowerCase()] || "#94A3B8";
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    payload: { label: string; count: number; color: string };
  }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const { label, count, color } = payload[0].payload;

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
        {count} lead{count !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

const LeadsBySourceChart = ({ data }: LeadsBySourceChartProps) => {
  const chartData = useMemo(
    () =>
      data
        .filter((item) => item.count > 0)
        .map((item) => ({
          source: item.source,
          label: getSourceLabel(item.source),
          count: Number(item.count),
          color: getSourceColor(item.source),
        })),
    [data],
  );

  const total = useMemo(
    () => chartData.reduce((sum, item) => sum + item.count, 0),
    [chartData],
  );

  return (
    <Card className="hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
          <PieChartIcon className="h-4 w-4 text-amber-600" />
        </div>
        <CardTitle>Leads por Origem</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Nenhum dado de origem disponível
            </p>
          </div>
        ) : (
          <>
            <div className="relative mx-auto h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                    strokeWidth={0}
                    cornerRadius={4}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
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
              {chartData.map((entry, index) => (
                <div
                  key={index}
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
                    {entry.count}
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

export default LeadsBySourceChart;
