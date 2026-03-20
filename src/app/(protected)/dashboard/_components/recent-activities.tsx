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
  { icon: typeof CalendarDays; bgColor: string; iconColor: string }
> = {
  appointment: {
    icon: CalendarDays,
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
  patient: {
    icon: UserPlus,
    bgColor: "bg-yellow-600/10",
    iconColor: "text-yellow-700",
  },
  transaction: {
    icon: DollarSign,
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
};

const RecentActivities = ({ activities }: RecentActivitiesProps) => {
  return (
    <Card className="hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
          <Activity className="h-4 w-4 text-amber-600" />
        </div>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Nenhuma atividade recente
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity, index) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;

              return (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}
                  >
                    <Icon className={`h-4 w-4 ${config.iconColor}`} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm">{activity.description}</p>
                    <span className="text-muted-foreground text-xs">
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
