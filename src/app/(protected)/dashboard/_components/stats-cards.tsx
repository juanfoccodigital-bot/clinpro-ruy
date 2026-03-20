import {
  CalendarIcon,
  DollarSignIcon,
  MessageCircle,
  UserIcon,
} from "lucide-react";

import { formatCurrencyInCents } from "@/helpers/currency";

interface StatsCardsProps {
  totalRevenue: number | null;
  totalAppointments: number;
  totalPatients: number;
  activeConversations: number;
}

const StatsCards = ({
  totalRevenue,
  totalAppointments,
  totalPatients,
  activeConversations,
}: StatsCardsProps) => {
  const stats = [
    {
      title: "Faturamento",
      value: totalRevenue ? formatCurrencyInCents(totalRevenue) : "R$ 0,00",
      icon: DollarSignIcon,
      gradient: "from-amber-500 to-amber-600",
      glow: "shadow-amber-500/25",
      bg: "from-amber-50 to-transparent",
    },
    {
      title: "Procedimentos",
      value: totalAppointments.toString(),
      icon: CalendarIcon,
      gradient: "from-yellow-500 to-amber-500",
      glow: "shadow-yellow-500/25",
      bg: "from-yellow-50 to-transparent",
    },
    {
      title: "Pacientes",
      value: totalPatients.toString(),
      icon: UserIcon,
      gradient: "from-amber-600 to-yellow-700",
      glow: "shadow-amber-600/25",
      bg: "from-orange-50 to-transparent",
    },
    {
      title: "Conversas Ativas",
      value: activeConversations.toString(),
      icon: MessageCircle,
      gradient: "from-yellow-600 to-amber-600",
      glow: "shadow-yellow-600/25",
      bg: "from-amber-50 to-transparent",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="animate-fade-slide-up group relative overflow-hidden rounded-2xl border border-amber-500/5 bg-card p-6 shadow-sm transition-all duration-300 hover-glow"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            {/* Background gradient on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
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

export default StatsCards;
