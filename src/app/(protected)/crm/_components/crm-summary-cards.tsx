"use client";

import {
  CalendarCheck,
  TrendingUp,
  UserPlus,
  UsersRound,
} from "lucide-react";

interface CrmSummaryCardsProps {
  totalContacts: number;
  whatsappContacts: number;
  manualContacts: number;
  recentContacts: number;
}

const CrmSummaryCards = ({
  totalContacts,
  recentContacts,
}: CrmSummaryCardsProps) => {
  const cards = [
    {
      title: "Total de Leads",
      value: totalContacts,
      icon: UsersRound,
      gradient: "from-primary to-amber-600",
    },
    {
      title: "Novos (30 dias)",
      value: recentContacts,
      icon: UserPlus,
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Taxa de Conversão",
      value: totalContacts > 0 ? `${Math.round((recentContacts / totalContacts) * 100)}%` : "0%",
      icon: TrendingUp,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Agendados",
      value: "—",
      icon: CalendarCheck,
      gradient: "from-violet-500 to-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all duration-300 hover-glow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg transition-transform group-hover:scale-110`}>
                <Icon className="h-4.5 w-4.5 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CrmSummaryCards;
