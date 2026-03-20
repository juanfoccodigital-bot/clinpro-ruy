import { headers } from "next/headers";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { getPatientReport } from "@/data/get-report-data";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import PatientReportView from "./_components/patient-report-view";

const PacientesRelatorioPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const data = await getPatientReport({ clinicId });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Relatorio de Pacientes</PageTitle>
            <PageDescription>
              Estatisticas sobre os pacientes cadastrados na clinica.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <PatientReportView data={data} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default PacientesRelatorioPage;
