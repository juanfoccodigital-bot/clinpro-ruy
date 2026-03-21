import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import { BarChart3 } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageBanner, PageContainer, PageContent } from "@/components/ui/page-container";
import { getCommercialDashboard } from "@/data/get-commercial-dashboard";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import { CommercialDateFilter } from "./_components/commercial-date-filter";
import CommercialStatsCards from "./_components/commercial-stats-cards";
import DailyLeadsChart from "./_components/daily-leads-chart";
import LeadsBySourceChart from "./_components/leads-by-source-chart";
import LeadsFunnelChart from "./_components/leads-funnel-chart";

dayjs.locale("pt-br");

interface CommercialDashboardPageProps {
  searchParams: Promise<{
    from: string;
    to: string;
  }>;
}

const CommercialDashboardPage = async ({
  searchParams,
}: CommercialDashboardPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic?.id) {
    redirect("/clinic-form");
  }

  const { from, to } = await searchParams;
  if (!from || !to) {
    redirect(
      `/crm/dashboard?from=${dayjs().startOf("month").format("YYYY-MM-DD")}&to=${dayjs().endOf("month").format("YYYY-MM-DD")}`,
    );
  }

  const clinicId = session.user.clinic.id;

  const {
    totalLeads,
    totalInPipeline,
    withoutStage,
    converted,
    conversionRate,
    lost,
    leadsByStage,
    leadsBySource,
    dailyLeads,
  } = await getCommercialDashboard({
    clinicId,
    from,
    to,
  });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageBanner
          icon={BarChart3}
          title="Dashboard Comercial"
          description="Acompanhe o desempenho do seu time de vendas e a conversão de leads"
        >
          <CommercialDateFilter />
        </PageBanner>

        <PageContent>
          {/* Stats Cards */}
          <div className="animate-fade-slide-up delay-1">
            <CommercialStatsCards
              totalLeads={totalLeads}
              totalInPipeline={totalInPipeline}
              withoutStage={withoutStage}
              converted={converted}
              conversionRate={conversionRate}
              lost={lost}
            />
          </div>

          {/* Charts Row 1: Funnel + Source */}
          <div className="animate-fade-slide-up delay-2 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <LeadsFunnelChart data={leadsByStage} />
            <LeadsBySourceChart data={leadsBySource} />
          </div>

          {/* Charts Row 2: Daily Leads */}
          <div className="animate-fade-slide-up delay-3">
            <DailyLeadsChart data={dailyLeads} from={from} to={to} />
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default CommercialDashboardPage;
