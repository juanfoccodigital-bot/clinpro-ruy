import dayjs from "dayjs";
import { headers } from "next/headers";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { getAppointmentReport } from "@/data/get-report-data";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AppointmentReportView from "./_components/appointment-report-view";

const AgendamentosRelatorioPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const startDate = dayjs().startOf("month").toISOString();
  const endDate = dayjs().endOf("month").toISOString();

  const data = await getAppointmentReport({ clinicId, startDate, endDate });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Relatorio de Procedimentos</PageTitle>
            <PageDescription>
              Volume de procedimentos por status no mes atual.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <AppointmentReportView data={data} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default AgendamentosRelatorioPage;
