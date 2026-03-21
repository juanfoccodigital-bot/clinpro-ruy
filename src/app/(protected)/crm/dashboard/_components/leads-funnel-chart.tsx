"use client";

import { GitBranch } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeadsByStage {
  stageName: string;
  stageColor: string;
  count: number;
}

interface LeadsFunnelChartProps {
  data: LeadsByStage[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    payload: LeadsByStage;
  }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const { stageName, stageColor, count } = payload[0].payload;

  return (
    <div className="rounded-xl border bg-background px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: stageColor }}
        />
        <span className="text-sm font-medium">{stageName}</span>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        {count} contato{count !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

const LeadsFunnelChart = ({ data }: LeadsFunnelChartProps) => {
  return (
    <Card className="hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
          <GitBranch className="h-4 w-4 text-amber-600" />
        </div>
        <CardTitle>Leads por Etapa</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Nenhuma etapa configurada
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                horizontal={false}
              />
              <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                type="category"
                dataKey="stageName"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.stageColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadsFunnelChart;
