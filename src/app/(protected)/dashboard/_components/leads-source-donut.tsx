"use client";

import { TargetIcon } from "lucide-react";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeadsSourceDonutProps {
  data: { source: string | null; count: number }[];
}

const sourceConfig: Record<string, { label: string; color: string }> = {
  facebook: { label: "Facebook", color: "#1877F2" },
  instagram: { label: "Instagram", color: "#E4405F" },
  indicacao: { label: "Indicacao", color: "#D08C32" },
  google: { label: "Google", color: "#34A853" },
  site: { label: "Site", color: "#D3AB32" },
  whatsapp: { label: "WhatsApp", color: "#25D366" },
  tiktok: { label: "TikTok", color: "#010101" },
  outro: { label: "Outro", color: "#94A3B8" },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: { label: string; count: number; color: string } }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const { label, count, color } = payload[0].payload;
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
        <span className="font-bold text-foreground">{count}</span> lead{count !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

const LeadsSourceDonut = ({ data }: LeadsSourceDonutProps) => {
  const chartData = useMemo(
    () =>
      data
        .filter((item) => item.count > 0)
        .map((item) => {
          const key = (item.source || "outro").toLowerCase();
          const config = sourceConfig[key] || sourceConfig.outro;
          return {
            source: item.source || "outro",
            label: config.label,
            count: item.count,
            color: config.color,
          };
        }),
    [data],
  );

  const total = useMemo(
    () => chartData.reduce((sum, item) => sum + item.count, 0),
    [chartData],
  );

  return (
    <Card className="shadow-luxury transition-shadow duration-300 hover:shadow-luxury-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D08C32]/15 to-[#D3AB32]/10">
          <TargetIcon className="h-4 w-4 text-[#D08C32]" />
        </div>
        <div>
          <CardTitle>Origem dos Leads</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Por canal de aquisicao</p>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#D08C32]/5">
                <TargetIcon className="h-5 w-5 text-[#D08C32]/40" />
              </div>
              <p className="text-muted-foreground text-sm">
                Nenhum lead no periodo
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
                    {chartData.map((entry) => (
                      <Cell key={entry.source} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-[#261C10] dark:text-white">{total}</span>
                <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Leads</span>
              </div>
            </div>

            <div className="divider-gold my-4" />

            <div className="grid grid-cols-2 gap-1.5">
              {chartData.map((entry) => (
                <div
                  key={entry.source}
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

export default LeadsSourceDonut;
