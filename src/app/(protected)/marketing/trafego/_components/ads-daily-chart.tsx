"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DailyData {
  date: string;
  spend: number;
  leads: number;
  clicks: number;
  impressions: number;
}

interface AdsDailyChartProps {
  data: DailyData[];
}

type MetricKey = "spend" | "leads" | "clicks" | "impressions";

const metrics: { key: MetricKey; label: string; color: string; format: (v: number) => string }[] = [
  { key: "spend", label: "Investimento", color: "#d97706", format: (v) => `R$ ${v.toFixed(2)}` },
  { key: "leads", label: "Leads", color: "#10b981", format: (v) => v.toString() },
  { key: "clicks", label: "Cliques", color: "#3b82f6", format: (v) => v.toLocaleString("pt-BR") },
  { key: "impressions", label: "Impressões", color: "#f97316", format: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString() },
];

export default function AdsDailyChart({ data }: AdsDailyChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("spend");
  const metric = metrics.find((m) => m.key === activeMetric)!;

  const chartData = data.map((d) => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
  }));

  return (
    <Card className="animate-fade-slide-up" style={{ animationDelay: "300ms" }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Performance Diária</CardTitle>
        <div className="flex gap-1">
          {metrics.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeMetric === m.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} stroke="#999" />
              <YAxis tick={{ fontSize: 12 }} stroke="#999" />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(value: number) => [metric.format(value), metric.label]}
                labelFormatter={(label) => `Dia ${label}`}
              />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={metric.color}
                strokeWidth={2.5}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
