import {
  AlertCircle,
  Calendar,
  GitBranch,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

interface CommercialStatsCardsProps {
  totalLeads: number;
  totalInPipeline: number;
  withoutStage: number;
  converted: number;
  conversionRate: number;
  lost: number;
}

const CommercialStatsCards = ({
  totalLeads,
  totalInPipeline,
  withoutStage,
  converted,
  conversionRate,
  lost,
}: CommercialStatsCardsProps) => {
  const stats = [
    {
      title: "Total de Leads",
      value: totalLeads.toString(),
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      glow: "shadow-blue-500/25",
      bg: "from-blue-50 to-transparent",
    },
    {
      title: "No Pipeline",
      value: totalInPipeline.toString(),
      icon: GitBranch,
      gradient: "from-amber-500 to-amber-600",
      glow: "shadow-amber-500/25",
      bg: "from-amber-50 to-transparent",
    },
    {
      title: "Sem Etapa",
      value: withoutStage.toString(),
      icon: AlertCircle,
      gradient: "from-gray-500 to-gray-600",
      glow: "shadow-gray-500/25",
      bg: "from-gray-50 to-transparent",
    },
    {
      title: "Agendados",
      value: converted.toString(),
      icon: Calendar,
      gradient: "from-green-500 to-green-600",
      glow: "shadow-green-500/25",
      bg: "from-green-50 to-transparent",
    },
    {
      title: "Taxa de Conversão",
      value: `${conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-emerald-600",
      glow: "shadow-emerald-500/25",
      bg: "from-emerald-50 to-transparent",
    },
    {
      title: "Leads Perdidos",
      value: lost.toString(),
      icon: XCircle,
      gradient: "from-red-500 to-red-600",
      glow: "shadow-red-500/25",
      bg: "from-red-50 to-transparent",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="animate-fade-slide-up group relative overflow-hidden rounded-2xl border border-amber-500/5 bg-card p-6 shadow-sm transition-all duration-300 hover-glow"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
            />

            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.glow} transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommercialStatsCards;
