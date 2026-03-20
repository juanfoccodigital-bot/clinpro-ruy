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
import { getOccupancyReport } from "@/data/get-report-data";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import OccupancyReportView from "./_components/occupancy-report-view";

const OcupacaoPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const startDate = dayjs().startOf("month").toISOString();
  const endDate = dayjs().endOf("month").toISOString();

  const data = await getOccupancyReport({ clinicId, startDate, endDate });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Relatorio de Ocupacao</PageTitle>
            <PageDescription>
              Taxa de ocupacao e aproveitamento dos horarios no mes atual.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <OccupancyReportView data={data} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default OcupacaoPage;
