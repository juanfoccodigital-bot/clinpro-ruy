import {
  AlertTriangleIcon,
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  UserIcon,
} from "lucide-react";

import { formatCurrencyInCents } from "@/helpers/currency";

interface StatsCardsProps {
  totalRevenue: number | null;
  totalAppointments: number;
  totalPatients: number;
  activeConversations: number;
  pendingReceivables?: number | null;
  overdueCount?: number;
}

const StatsCards = ({
  totalRevenue,
  totalAppointments,
  totalPatients,
  activeConversations,
  pendingReceivables,
  overdueCount,
}: StatsCardsProps) => {
  const stats: { title: string; value: string; icon: typeof DollarSignIcon; gradient: string; glow: string; bg: string; trend: { value: number; up: boolean } | null }[] = [
    {
      title: "Faturamento",
      value: totalRevenue ? formatCurrencyInCents(totalRevenue) : "R$ 0,00",
      icon: DollarSignIcon,
      gradient: "from-[#D08C32] to-[#B8740A]",
      glow: "shadow-[#D08C32]/25",
      bg: "from-[#D08C32]/6 via-[#D3AB32]/3 to-transparent",
      trend: null,
    },
    {
      title: "A Receber",
      value: pendingReceivables
        ? formatCurrencyInCents(pendingReceivables)
        : "R$ 0,00",
      icon: ClockIcon,
      gradient: "from-[#E6A817] to-[#D3AB32]",
      glow: "shadow-[#E6A817]/25",
      bg: "from-[#E6A817]/6 via-[#D3AB32]/3 to-transparent",
      trend: null,
    },
    {
      title: "Inadimplentes",
      value: (overdueCount ?? 0).toString(),
      icon: AlertTriangleIcon,
      gradient: "from-[#DC2626] to-[#B91C1C]",
      glow: "shadow-[#DC2626]/25",
      bg: "from-[#DC2626]/6 via-[#B91C1C]/3 to-transparent",
      trend: null,
    },
    {
      title: "Procedimentos",
      value: totalAppointments.toString(),
      icon: CalendarIcon,
      gradient: "from-[#D3AB32] to-[#D08C32]",
      glow: "shadow-[#D3AB32]/25",
      bg: "from-[#D3AB32]/6 via-[#D08C32]/3 to-transparent",
      trend: null,
    },
    {
      title: "Pacientes",
      value: totalPatients.toString(),
      icon: UserIcon,
      gradient: "from-[#B8740A] to-[#D08C32]",
      glow: "shadow-[#B8740A]/25",
      bg: "from-[#B8740A]/5 via-[#D08C32]/3 to-transparent",
      trend: null,
    },
    {
      title: "Conversas Ativas",
      value: activeConversations.toString(),
      icon: MessageCircle,
      gradient: "from-[#D08C32] to-[#D3AB32]",
      glow: "shadow-[#D08C32]/25",
      bg: "from-[#D08C32]/5 via-[#D3AB32]/3 to-transparent",
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="animate-fade-slide-up group relative overflow-hidden rounded-2xl border border-[#D08C32]/5 bg-card p-3 sm:p-6 shadow-luxury transition-all duration-300 hover-glow shimmer-hover"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-50 transition-opacity duration-500 group-hover:opacity-100`} />

            <div className="relative flex items-center justify-between">
              <div className="space-y-1.5">
                <p className="text-muted-foreground text-sm font-medium">
                  {stat.title}
                </p>
                <p className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#261C10] dark:text-white truncate">{stat.value}</p>
                {/* Trend indicator */}
                {stat.trend && (
                <div className="flex items-center gap-1">
                  {stat.trend.up ? (
                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs font-semibold ${stat.trend.up ? "text-emerald-600" : "text-red-500"}`}>
                    {stat.trend.value}%
                  </span>
                  <span className="text-muted-foreground text-xs">vs. anterior</span>
                </div>
                )}
              </div>
              <div
                className={`flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.glow} transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
