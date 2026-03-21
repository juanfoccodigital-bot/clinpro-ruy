"use client";

import { FilterIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FunnelStage {
  stageName: string;
  stageColor: string;
  stageOrder: number;
  count: number;
}

interface FunnelOverviewProps {
  data: FunnelStage[];
}

const FunnelOverview = ({ data }: FunnelOverviewProps) => {
  const maxCount = Math.max(...data.map((s) => s.count), 1);
  const totalLeads = data.reduce((sum, s) => sum + s.count, 0);

  return (
    <Card className="shadow-luxury transition-shadow duration-300 hover:shadow-luxury-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D08C32]/15 to-[#D3AB32]/10">
          <FilterIcon className="h-4 w-4 text-[#D08C32]" />
        </div>
        <div>
          <CardTitle>Funil de Vendas</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalLeads} lead{totalLeads !== 1 ? "s" : ""} no funil
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[120px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#D08C32]/5">
                <FilterIcon className="h-5 w-5 text-[#D08C32]/40" />
              </div>
              <p className="text-muted-foreground text-sm">
                Nenhum lead no funil ainda
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Configure seu pipeline no CRM
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((stage, index) => {
              const widthPct = Math.max((stage.count / maxCount) * 100, 8);
              const pct = totalLeads > 0 ? ((stage.count / totalLeads) * 100).toFixed(1) : "0";
              return (
                <div key={stage.stageName} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: stage.stageColor }}
                      />
                      <span className="text-sm font-medium text-[#261C10] dark:text-white">
                        {stage.stageName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                      <span className="text-sm font-bold tabular-nums text-[#261C10] dark:text-white">
                        {stage.count}
                      </span>
                    </div>
                  </div>
                  <div className="h-8 w-full rounded-lg bg-[#D08C32]/5 overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-2"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: stage.stageColor,
                        opacity: 1 - index * 0.08,
                      }}
                    >
                      {widthPct > 15 && (
                        <span className="text-xs font-semibold text-white/90">
                          {stage.count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Conversion arrow indicators */}
            {data.length > 1 && (
              <div className="divider-gold my-3" />
            )}
            {data.length > 1 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Taxa de conversao geral:{" "}
                  <span className="font-bold text-[#D08C32]">
                    {totalLeads > 0
                      ? ((data[data.length - 1].count / data[0].count) * 100).toFixed(1)
                      : "0"}
                    %
                  </span>
                </span>
                <span>
                  {data[0].stageName} → {data[data.length - 1].stageName}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FunnelOverview;
