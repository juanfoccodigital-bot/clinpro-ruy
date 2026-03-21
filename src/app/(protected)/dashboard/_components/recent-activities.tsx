"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Activity, CalendarDays, DollarSign, UserPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

interface ActivityItem {
  type: "appointment" | "patient" | "transaction";
  description: string;
  timestamp: Date;
}

interface RecentActivitiesProps {
  activities: ActivityItem[];
}

const activityConfig: Record<
  ActivityItem["type"],
  { icon: typeof CalendarDays; bgColor: string; iconColor: string; accentBorder: string }
> = {
  appointment: {
    icon: CalendarDays,
    bgColor: "bg-[#D08C32]/10",
    iconColor: "text-[#D08C32]",
    accentBorder: "border-l-[#D08C32]",
  },
  patient: {
    icon: UserPlus,
    bgColor: "bg-[#D3AB32]/10",
    iconColor: "text-[#D3AB32]",
    accentBorder: "border-l-[#D3AB32]",
  },
  transaction: {
    icon: DollarSign,
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    accentBorder: "border-l-emerald-500",
  },
};

const RecentActivities = ({ activities }: RecentActivitiesProps) => {
  return (
    <Card className="shadow-luxury transition-shadow duration-300 hover:shadow-luxury-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D08C32]/15 to-[#D3AB32]/10">
          <Activity className="h-4 w-4 text-[#D08C32]" />
        </div>
        <div>
          <CardTitle>Atividades Recentes</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Ultimas atualizacoes</p>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#D08C32]/5">
                <Activity className="h-5 w-5 text-[#D08C32]/40" />
              </div>
              <p className="text-muted-foreground text-sm">
                Nenhuma atividade recente
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity, index) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 rounded-xl border-l-2 ${config.accentBorder} p-2.5 pl-3 transition-colors hover:bg-[#D08C32]/3`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}
                  >
                    <Icon className={`h-4 w-4 ${config.iconColor}`} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-medium">{activity.description}</p>
                    <span className="text-muted-foreground text-xs mt-0.5">
                      {dayjs(activity.timestamp).fromNow()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
