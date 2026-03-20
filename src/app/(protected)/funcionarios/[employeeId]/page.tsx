import dayjs from "dayjs";
import { and, desc, eq } from "drizzle-orm";
import { ArrowLeftIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/db";
import { employeesTable, timeTrackingTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddTimeRecordButton from "./_components/add-time-record-button";
import PermissionsForm from "./_components/permissions-form";
import TimeRecordDataTable from "./_components/time-record-data-table";

const roleLabels: Record<string, string> = {
  admin: "Admin",
  doctor: "Outro",
  receptionist: "Recepcionista",
  nurse: "Enfermeiro(a)",
  manager: "Gerente",
  other: "Outro",
};

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800 border-red-200",
  doctor: "bg-blue-100 text-blue-800 border-blue-200",
  receptionist: "bg-green-100 text-green-800 border-green-200",
  nurse: "bg-amber-100 text-amber-800 border-amber-200",
  manager: "bg-orange-100 text-orange-800 border-orange-200",
  other: "bg-gray-100 text-gray-800 border-gray-200",
};

interface EmployeeDetailPageProps {
  params: Promise<{ employeeId: string }>;
}

const EmployeeDetailPage = async ({ params }: EmployeeDetailPageProps) => {
  const { employeeId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const employee = await db.query.employeesTable.findFirst({
    where: and(
      eq(employeesTable.id, employeeId),
      eq(employeesTable.clinicId, clinicId),
    ),
    with: {
      permissions: true,
      timeRecords: true,
    },
  });

  if (!employee) {
    notFound();
  }

  const timeRecords = await db.query.timeTrackingTable.findMany({
    where: and(
      eq(timeTrackingTable.employeeId, employeeId),
      eq(timeTrackingTable.clinicId, clinicId),
    ),
    orderBy: [desc(timeTrackingTable.clockIn)],
  });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>{employee.name}</PageTitle>
            <PageDescription>
              Detalhes, permissoes e registro de ponto do funcionario.
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <Link href="/funcionarios">
              <Button variant="outline">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </PageActions>
        </PageHeader>
        <PageContent>
          <Card>
            <CardHeader>
              <CardTitle>Informacoes do Funcionario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-muted-foreground text-sm">Nome</p>
                  <p className="font-medium">{employee.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Cargo</p>
                  <Badge
                    variant="outline"
                    className={roleColors[employee.role]}
                  >
                    {roleLabels[employee.role] ?? employee.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">E-mail</p>
                  <p className="font-medium">{employee.email || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Telefone</p>
                  <p className="font-medium">{employee.phoneNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">CPF</p>
                  <p className="font-medium">{employee.cpf || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Especialidade</p>
                  <p className="font-medium">{employee.specialty || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Data de Admissao
                  </p>
                  <p className="font-medium">
                    {employee.hireDate
                      ? dayjs(employee.hireDate).format("DD/MM/YYYY")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Salario</p>
                  <p className="font-medium">
                    {employee.salary
                      ? (employee.salary / 100).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Status</p>
                  {employee.isActive ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      Ativo
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-800 border-gray-200"
                    >
                      Inativo
                    </Badge>
                  )}
                </div>
                <div className="col-span-2 md:col-span-3">
                  <p className="text-muted-foreground text-sm">Observacoes</p>
                  <p className="font-medium">{employee.notes || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="permissions" className="w-full">
            <TabsList>
              <TabsTrigger value="permissions">Permissoes</TabsTrigger>
              <TabsTrigger value="timeTracking">Registro de Ponto</TabsTrigger>
            </TabsList>
            <TabsContent value="permissions">
              <Card>
                <CardHeader>
                  <CardTitle>Permissoes de Acesso</CardTitle>
                </CardHeader>
                <CardContent>
                  <PermissionsForm
                    employeeId={employee.id}
                    permissions={employee.permissions}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="timeTracking">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Registros de Ponto</CardTitle>
                  <AddTimeRecordButton employeeId={employee.id} />
                </CardHeader>
                <CardContent>
                  <TimeRecordDataTable data={timeRecords} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default EmployeeDetailPage;
