import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { doctorCommissionsTable, doctorsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddCommissionButton from "./_components/add-commission-button";
import CommissionTableActions from "./_components/commission-table-actions";

const ComissoesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, clinicId),
  });

  const commissions = await db.query.doctorCommissionsTable.findMany({
    where: eq(doctorCommissionsTable.clinicId, clinicId),
    with: {
      doctor: true,
    },
  });

  // Build a map of doctorId -> commission for quick lookup
  const commissionsByDoctorId = new Map(
    commissions.map((c) => [c.doctorId, c]),
  );

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Comissões</PageTitle>
            <PageDescription>
              Gerencie os percentuais de comissão dos profissionais da clínica.
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddCommissionButton doctors={doctors} />
          </PageActions>
        </PageHeader>
        <PageContent>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Profissionais e Comissões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Comissao (%)</TableHead>
                    <TableHead>Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.length > 0 ? (
                    doctors.map((doctor) => {
                      const commission = commissionsByDoctorId.get(doctor.id);
                      return (
                        <TableRow key={doctor.id}>
                          <TableCell className="font-medium">
                            {doctor.name}
                          </TableCell>
                          <TableCell>{doctor.specialty}</TableCell>
                          <TableCell>
                            {commission ? (
                              <Badge
                                variant="outline"
                                className="bg-blue-100 text-blue-800 border-blue-200"
                              >
                                {commission.commissionPercentage}%
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-gray-100 text-gray-800 border-gray-200"
                              >
                                Nao definida
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <CommissionTableActions
                              doctor={doctor}
                              commission={commission}
                              doctors={doctors}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Nenhum profissional encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default ComissoesPage;
