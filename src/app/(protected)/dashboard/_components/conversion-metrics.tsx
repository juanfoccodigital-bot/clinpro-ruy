"use client";

import { ArrowRightIcon, BarChart3Icon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConversionMetricsProps {
  totalPatients: number;
  recentLeads: number;
  totalAppointments: number;
  completedAppointments: number;
}

const ConversionMetrics = ({
  totalPatients,
  recentLeads,
  totalAppointments,
  completedAppointments,
}: ConversionMetricsProps) => {
  const scheduledRate =
    totalPatients > 0
      ? ((totalAppointments / totalPatients) * 100).toFixed(1)
      : "0";
  const completionRate =
    totalAppointments > 0
      ? ((completedAppointments / totalAppointments) * 100).toFixed(1)
      : "0";

  const stages = [
    {
      label: "Leads",
      value: totalPatients,
      color: "#D08C32",
      sub: `+${recentLeads} nos ultimos 7 dias`,
    },
    {
      label: "Agendados",
      value: totalAppointments,
      color: "#D3AB32",
      sub: `${scheduledRate}% de conversao`,
    },
    {
      label: "Concluidos",
      value: completedAppointments,
      color: "#B8740A",
      sub: `${completionRate}% de conclusao`,
    },
  ];

  const maxVal = Math.max(...stages.map((s) => s.value), 1);

  return (
    <Card className="shadow-luxury transition-shadow duration-300 hover:shadow-luxury-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D08C32]/15 to-[#D3AB32]/10">
          <BarChart3Icon className="h-4 w-4 text-[#D08C32]" />
        </div>
        <div>
          <CardTitle>Metricas de Conversao</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Funil de atendimento</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {stages.map((stage, index) => {
            const barWidth = Math.max((stage.value / maxVal) * 100, 5);
            return (
              <div key={stage.label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {index > 0 && (
                      <ArrowRightIcon className="h-3 w-3 text-muted-foreground -ml-1 mr-0.5" />
                    )}
                    <span className="text-sm font-medium text-[#261C10] dark:text-white">
                      {stage.label}
                    </span>
                  </div>
                  <span className="text-xl font-bold tabular-nums text-[#261C10] dark:text-white">
                    {stage.value}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#D08C32]/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{stage.sub}</p>
              </div>
            );
          })}
        </div>

        {totalPatients > 0 && (
          <>
            <div className="divider-gold my-4" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Taxa geral (Lead → Concluido)
              </span>
              <span className="text-sm font-bold text-[#D08C32]">
                {totalPatients > 0
                  ? ((completedAppointments / totalPatients) * 100).toFixed(1)
                  : "0"}
                %
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversionMetrics;
