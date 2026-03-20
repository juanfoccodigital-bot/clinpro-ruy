"use client";

import {
  CalendarCheckIcon,
  CalendarXIcon,
  PercentIcon,
  UserXIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DoctorStat {
  doctorId: string;
  doctorName: string;
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
  occupancyRate: number;
}

interface OccupancyReportViewProps {
  data: DoctorStat[];
}

const OccupancyReportView = ({ data }: OccupancyReportViewProps) => {
  const totalAppointments = data.reduce((acc, d) => acc + d.total, 0);
  const totalCompleted = data.reduce((acc, d) => acc + d.completed, 0);
  const totalCancelled = data.reduce((acc, d) => acc + d.cancelled, 0);
  const totalNoShow = data.reduce((acc, d) => acc + d.noShow, 0);
  const overallOccupancy =
    totalAppointments > 0
      ? Math.round((totalCompleted / totalAppointments) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Procedimentos
            </CardTitle>
            <CalendarCheckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Procedimentos no periodo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Ocupacao
            </CardTitle>
            <PercentIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {overallOccupancy}%
            </div>
            <p className="text-xs text-muted-foreground">
              Procedimentos completados / total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cancelamentos
            </CardTitle>
            <CalendarXIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalCancelled}
            </div>
            <p className="text-xs text-muted-foreground">
              Procedimentos cancelados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faltas</CardTitle>
            <UserXIcon className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {totalNoShow}
            </div>
            <p className="text-xs text-muted-foreground">
              Pacientes que faltaram
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default OccupancyReportView;
