"use client";

import {
  CalendarCheckIcon,
  CalendarDaysIcon,
  CalendarXIcon,
  ClockIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusLabels: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  arrived: "Chegou",
  in_service: "Em Atendimento",
  completed: "Completado",
  cancelled: "Cancelado",
  no_show: "Faltou",
};

const statusBadgeClasses: Record<string, string> = {
  scheduled: "bg-gray-100 text-gray-800 border-gray-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  arrived: "bg-amber-100 text-amber-800 border-amber-200",
  in_service: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  no_show: "bg-orange-100 text-orange-800 border-orange-200",
};

interface StatusItem {
  status: string;
  count: number;
}

interface AppointmentReportData {
  total: number;
  avgPerDay: number;
  byStatus: StatusItem[];
}

interface AppointmentReportViewProps {
  data: AppointmentReportData;
}

const AppointmentReportView = ({ data }: AppointmentReportViewProps) => {
  const completedCount =
    data.byStatus.find((s) => s.status === "completed")?.count ?? 0;
  const cancelledCount =
    data.byStatus.find((s) => s.status === "cancelled")?.count ?? 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Procedimentos
            </CardTitle>
            <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total}</div>
            <p className="text-xs text-muted-foreground">
              Procedimentos no periodo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media por Dia</CardTitle>
            <ClockIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.avgPerDay}
            </div>
            <p className="text-xs text-muted-foreground">
              Procedimentos por dia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CalendarCheckIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Atendimentos realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
            <CalendarXIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {cancelledCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Procedimentos cancelados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* By Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byStatus.length > 0 ? (
                  data.byStatus.map((item) => (
                    <TableRow key={item.status}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            statusBadgeClasses[item.status] ?? ""
                          }
                        >
                          {statusLabels[item.status] ?? item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.count}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      Nenhum agendamento encontrado no periodo.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentReportView;
