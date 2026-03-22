import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPatientAppointments } from "@/data/get-portal-data";
import { getPortalSession } from "@/lib/portal-auth";

const statusLabels: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  arrived: "Chegou",
  in_service: "Em Atendimento",
  completed: "Concluido",
  cancelled: "Cancelado",
  no_show: "Nao Compareceu",
};

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  arrived: "bg-yellow-100 text-yellow-800",
  in_service: "bg-amber-100 text-amber-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-orange-100 text-orange-800",
};

export default async function PortalAgendamentosPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const appointments = await getPatientAppointments({
    patientId: session.patient.id,
    clinicId: session.patientUser.clinicId,
  });

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/portal">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Meus Agendamentos</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhum agendamento encontrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>
                      {dayjs(apt.date).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell>
                      {dayjs(apt.date).format("HH:mm")}
                    </TableCell>
                    <TableCell>{"—"}</TableCell>
                    <TableCell>{"—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[apt.status] || ""}
                      >
                        {statusLabels[apt.status] || apt.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
