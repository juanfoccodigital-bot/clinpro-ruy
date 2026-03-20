"use client";

import { UserCheckIcon, UserPlusIcon, UsersIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TopPatient {
  patientId: string;
  patientName: string;
  email: string;
  phoneNumber: string;
  appointments: number;
}

interface PatientReportData {
  totalPatients: number;
  newThisMonth: number;
  bySex: Record<string, number>;
  topPatients: TopPatient[];
}

interface PatientReportViewProps {
  data: PatientReportData;
}

const PatientReportView = ({ data }: PatientReportViewProps) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pacientes
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Pacientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novos este Mes
            </CardTitle>
            <UserPlusIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.newThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">
              Cadastrados no mes atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Masculino</CardTitle>
            <UserCheckIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.bySex.male ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Pacientes masculinos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feminino</CardTitle>
            <UserCheckIcon className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
              {data.bySex.female ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Pacientes femininos</p>
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Patients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Top 10 Pacientes (mais procedimentos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Procedimentos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topPatients.length > 0 ? (
                data.topPatients.map((patient, index) => (
                  <TableRow key={patient.patientId}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {patient.patientName}
                    </TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phoneNumber}</TableCell>
                    <TableCell className="text-right">
                      {patient.appointments}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum paciente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientReportView;
