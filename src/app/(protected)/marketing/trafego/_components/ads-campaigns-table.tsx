"use client";

import { useState } from "react";

import type { MetaAdsCampaign } from "@/actions/meta-ads";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdsCampaignsTableProps {
  campaigns: MetaAdsCampaign[];
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ACTIVE: { label: "Ativa", variant: "default" },
  PAUSED: { label: "Pausada", variant: "secondary" },
  DELETED: { label: "Removida", variant: "destructive" },
  ARCHIVED: { label: "Arquivada", variant: "outline" },
};

const objectiveMap: Record<string, string> = {
  OUTCOME_LEADS: "Leads",
  OUTCOME_TRAFFIC: "Tráfego",
  OUTCOME_AWARENESS: "Reconhecimento",
  OUTCOME_ENGAGEMENT: "Engajamento",
  OUTCOME_SALES: "Vendas",
  LEAD_GENERATION: "Geração de Leads",
  LINK_CLICKS: "Cliques no Link",
  CONVERSIONS: "Conversões",
  REACH: "Alcance",
  BRAND_AWARENESS: "Reconhecimento",
  POST_ENGAGEMENT: "Engajamento",
  MESSAGES: "Mensagens",
};

type StatusFilter = "ACTIVE" | "ALL" | "INACTIVE";

const filterOptions: { label: string; value: StatusFilter }[] = [
  { label: "Ativas", value: "ACTIVE" },
  { label: "Todas", value: "ALL" },
  { label: "Desativadas", value: "INACTIVE" },
];

export default function AdsCampaignsTable({ campaigns }: AdsCampaignsTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ACTIVE");

  const filteredCampaigns = [...campaigns]
    .filter((c) => {
      if (statusFilter === "ACTIVE") return c.status === "ACTIVE";
      if (statusFilter === "INACTIVE") return c.status !== "ACTIVE";
      return true;
    })
    .sort((a, b) => b.spend - a.spend);

  const activeCt = campaigns.filter((c) => c.status === "ACTIVE").length;
  const inactiveCt = campaigns.filter((c) => c.status !== "ACTIVE").length;

  return (
    <Card className="animate-fade-slide-up" style={{ animationDelay: "450ms" }}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">Campanhas</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {activeCt} ativas · {inactiveCt} desativadas · {campaigns.length} total
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-muted p-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                statusFilter === opt.value
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Campanha</th>
                <th className="pb-3 px-3 font-medium text-center">Status</th>
                <th className="pb-3 px-3 font-medium text-center">Objetivo</th>
                <th className="pb-3 px-3 font-medium text-right">Investido</th>
                <th className="pb-3 px-3 font-medium text-right">Leads</th>
                <th className="pb-3 px-3 font-medium text-right">CPL</th>
                <th className="pb-3 px-3 font-medium text-right">Cliques</th>
                <th className="pb-3 px-3 font-medium text-right">CTR</th>
                <th className="pb-3 px-3 font-medium text-right">CPM</th>
                <th className="pb-3 pl-3 font-medium text-right">Freq.</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((c) => {
                const st = statusMap[c.status] || { label: c.status, variant: "outline" as const };
                return (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-medium truncate max-w-[200px]">{c.name}</p>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant={st.variant} className="text-xs">{st.label}</Badge>
                    </td>
                    <td className="py-3 px-3 text-center text-xs text-muted-foreground">
                      {objectiveMap[c.objective] || c.objective}
                    </td>
                    <td className="py-3 px-3 text-right font-medium">
                      R$ {c.spend.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-600">
                      {c.leads}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {c.cpl > 0 ? `R$ ${c.cpl.toFixed(2)}` : "-"}
                    </td>
                    <td className="py-3 px-3 text-right">{c.clicks.toLocaleString("pt-BR")}</td>
                    <td className="py-3 px-3 text-right">{c.ctr.toFixed(2)}%</td>
                    <td className="py-3 px-3 text-right">R$ {c.cpm.toFixed(2)}</td>
                    <td className="py-3 pl-3 text-right">{c.frequency.toFixed(2)}</td>
                  </tr>
                );
              })}
              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted-foreground">
                    {statusFilter === "ACTIVE"
                      ? "Nenhuma campanha ativa no período"
                      : statusFilter === "INACTIVE"
                        ? "Nenhuma campanha desativada no período"
                        : "Nenhuma campanha encontrada no período"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
