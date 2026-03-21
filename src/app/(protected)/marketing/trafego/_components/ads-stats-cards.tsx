"use client";

import {
  BarChart3,
  DollarSign,
  Eye,
  MousePointerClick,
  Repeat,
  Target,
  Users,
  Zap,
} from "lucide-react";

interface AdsStatsCardsProps {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalLeads: number;
  totalReach: number;
  avgCpl: number;
  avgCpm: number;
  avgCtr: number;
  avgFrequency: number;
  leadCampaignSpend: number;
}

export default function AdsStatsCards({
  totalSpend,
  totalImpressions,
  totalClicks,
  totalLeads,
  totalReach,
  avgCpl,
  avgCpm,
  avgCtr,
  avgFrequency,
  leadCampaignSpend,
}: AdsStatsCardsProps) {
  const leadsPercent = totalSpend > 0 ? Math.round((leadCampaignSpend / totalSpend) * 100) : 0;
  const reconhecimentoPercent = 100 - leadsPercent;
  const reconhecimentoSpend = totalSpend - leadCampaignSpend;

  const stats = [
    {
      title: "Investimento Total",
      value: `R$ ${totalSpend.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      subtitle: `R$ ${leadCampaignSpend.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em leads (${leadsPercent}%) · ${reconhecimentoPercent}% reconhecimento`,
      icon: DollarSign,
      gradient: "from-amber-500 to-amber-600",
      size: "large",
    },
    {
      title: "Novos Contatos",
      value: totalLeads.toLocaleString("pt-BR"),
      subtitle: "Mensagens iniciadas",
      icon: Target,
      gradient: "from-emerald-500 to-emerald-600",
      size: "large",
    },
    {
      title: "CPL Real",
      value: `R$ ${avgCpl.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      subtitle: "Invest. leads ÷ contatos",
      icon: Zap,
      gradient: "from-amber-600 to-amber-700",
      size: "large",
    },
    {
      title: "CTR",
      value: `${avgCtr.toFixed(2)}%`,
      icon: MousePointerClick,
      gradient: "from-amber-500 to-yellow-600",
      size: "large",
    },
    {
      title: "Cliques",
      value: totalClicks.toLocaleString("pt-BR"),
      icon: MousePointerClick,
      gradient: "from-cyan-500 to-cyan-600",
      size: "small",
    },
    {
      title: "Impressões",
      value: totalImpressions >= 1000
        ? `${(totalImpressions / 1000).toFixed(1)}k`
        : totalImpressions.toLocaleString("pt-BR"),
      icon: Eye,
      gradient: "from-orange-500 to-orange-600",
      size: "small",
    },
    {
      title: "Alcance",
      value: totalReach >= 1000
        ? `${(totalReach / 1000).toFixed(1)}k`
        : totalReach.toLocaleString("pt-BR"),
      icon: Users,
      gradient: "from-pink-500 to-pink-600",
      size: "small",
    },
    {
      title: "CPM",
      value: `R$ ${avgCpm.toFixed(2)}`,
      icon: BarChart3,
      gradient: "from-indigo-500 to-indigo-600",
      size: "small",
    },
    {
      title: "Frequência",
      value: avgFrequency.toFixed(2),
      icon: Repeat,
      gradient: "from-teal-500 to-teal-600",
      size: "small",
    },
    {
      title: "Invest. Reconhecimento",
      value: `R$ ${reconhecimentoSpend.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      subtitle: `${reconhecimentoPercent}% do total`,
      icon: Eye,
      gradient: "from-purple-500 to-purple-600",
      size: "small",
    },
  ];

  const largeStats = stats.filter((s) => s.size === "large");
  const smallStats = stats.filter((s) => s.size === "small");

  return (
    <div className="space-y-4">
      {/* Main KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {largeStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="animate-fade-slide-up group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover-glow"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="relative flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  {"subtitle" in stat && stat.subtitle && (
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary metrics */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {smallStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="animate-fade-slide-up flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm"
              style={{ animationDelay: `${(index + 4) * 75}ms` }}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                <p className="text-sm font-bold">{stat.value}</p>
                {"subtitle" in stat && stat.subtitle && (
                  <p className="text-[10px] text-muted-foreground">{stat.subtitle}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
