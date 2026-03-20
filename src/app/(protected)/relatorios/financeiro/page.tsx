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
import { getFinancialReport } from "@/data/get-report-data";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import FinancialReportView from "./_components/financial-report-view";

const FinanceiroRelatorioPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const startDate = dayjs().startOf("month").toISOString();
  const endDate = dayjs().endOf("month").toISOString();

  const data = await getFinancialReport({ clinicId, startDate, endDate });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Relatorio Financeiro</PageTitle>
            <PageDescription>
              Receitas, despesas e lucro liquido da clinica no mes atual.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <FinancialReportView data={data} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default FinanceiroRelatorioPage;
