"use client";

import { ArrowRight, DollarSignIcon, MousePointerClick, TargetIcon, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrafficSummaryProps {
  data: {
    totalSpend: number;
    totalLeads: number;
    avgCpl: number;
    avgCtr: number;
  } | null;
}

const TrafficSummary = ({ data }: TrafficSummaryProps) => {
  return (
    <Card className="shadow-luxury transition-shadow duration-300 hover:shadow-luxury-lg">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D08C32]/15 to-[#D3AB32]/10">
            <Zap className="h-4 w-4 text-[#D08C32]" />
          </div>
          <div>
            <CardTitle>Trafego Pago</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Resumo Meta Ads</p>
          </div>
        </div>
        <Link
          href="/marketing/trafego"
          className="text-xs font-medium text-[#D08C32] hover:text-[#B8740A] transition-colors flex items-center gap-1"
        >
          Ver completo
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {!data ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#D08C32]/5">
                <Zap className="h-5 w-5 text-[#D08C32]/40" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                Conectar Meta Ads
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Configure as variaveis de ambiente para ver os dados
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#D08C32]/10 bg-gradient-to-br from-[#D08C32]/5 to-transparent p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSignIcon className="h-3.5 w-3.5 text-[#D08C32]" />
                <span className="text-xs text-muted-foreground">Investimento</span>
              </div>
              <p className="text-lg font-bold text-[#261C10] dark:text-white">
                R$ {data.totalSpend.toFixed(2).replace(".", ",")}
              </p>
            </div>

            <div className="rounded-xl border border-[#D08C32]/10 bg-gradient-to-br from-[#D3AB32]/5 to-transparent p-4">
              <div className="flex items-center gap-2 mb-2">
                <TargetIcon className="h-3.5 w-3.5 text-[#D3AB32]" />
                <span className="text-xs text-muted-foreground">Leads</span>
              </div>
              <p className="text-lg font-bold text-[#261C10] dark:text-white">
                {data.totalLeads}
              </p>
            </div>

            <div className="rounded-xl border border-[#D08C32]/10 bg-gradient-to-br from-[#B8740A]/5 to-transparent p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-[#B8740A]" />
                <span className="text-xs text-muted-foreground">CPL</span>
              </div>
              <p className="text-lg font-bold text-[#261C10] dark:text-white">
                R$ {data.avgCpl.toFixed(2).replace(".", ",")}
              </p>
            </div>

            <div className="rounded-xl border border-[#D08C32]/10 bg-gradient-to-br from-[#D08C32]/5 to-transparent p-4">
              <div className="flex items-center gap-2 mb-2">
                <MousePointerClick className="h-3.5 w-3.5 text-[#D08C32]" />
                <span className="text-xs text-muted-foreground">CTR</span>
              </div>
              <p className="text-lg font-bold text-[#261C10] dark:text-white">
                {data.avgCtr.toFixed(2)}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrafficSummary;
