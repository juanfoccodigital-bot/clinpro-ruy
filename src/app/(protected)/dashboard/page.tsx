import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getMetaAdsData } from "@/actions/meta-ads";
import { PageContainer, PageContent } from "@/components/ui/page-container";
import { getDashboard } from "@/data/get-dashboard";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AppointmentsChart from "./_components/appointments-chart";
import AppointmentsStatusChart from "./_components/appointments-status-chart";
import ConversionMetrics from "./_components/conversion-metrics";
import { DatePicker } from "./_components/date-picker";
import FunnelOverview from "./_components/funnel-overview";
import LeadsSourceDonut from "./_components/leads-source-donut";
import MiniCalendar from "./_components/mini-calendar";
import RecentActivities from "./_components/recent-activities";
import StatsCards from "./_components/stats-cards";
import TrafficSummary from "./_components/traffic-summary";
import UpcomingAppointments from "./_components/upcoming-appointments";

dayjs.locale("pt-br");

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

interface DashboardPageProps {
  searchParams: Promise<{
    from: string;
    to: string;
  }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
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
      `/dashboard?from=${dayjs().startOf("month").format("YYYY-MM-DD")}&to=${dayjs().endOf("month").format("YYYY-MM-DD")}`,
    );
  }
  const {
    totalRevenue,
    totalAppointments,
    totalPatients,
    activeConversations,
    dailyAppointmentsData,
    appointmentsByStatus,
    recentActivities,
    upcomingAppointments,
    appointmentDates,
    leadsByStage,
    leadsBySource,
    totalPatientsAll,
    recentLeadsTotal,
  } = await getDashboard({
    from,
    to,
    session: {
      user: {
        clinic: {
          id: session!.user.clinic!.id,
        },
      },
    },
  });

  // Fetch Meta Ads data (optional - wrapped in try/catch)
  let metaAdsData: {
    totalSpend: number;
    totalLeads: number;
    avgCpl: number;
    avgCtr: number;
  } | null = null;
  try {
    const metaResult = await getMetaAdsData(from, to);
    metaAdsData = {
      totalSpend: metaResult.totalSpend,
      totalLeads: metaResult.totalLeads,
      avgCpl: metaResult.avgCpl,
      avgCtr: metaResult.avgCtr,
    };
  } catch {
    metaAdsData = null;
  }

  // Compute completed appointments count from status data
  const completedAppointments =
    appointmentsByStatus.find((s) => s.status === "completed")?.total ?? 0;

  const greeting = getGreeting();
  const firstName = session.user.name?.split(" ")[0] || "Usuario";
  const clinicName = session.user.clinic?.name;
  const todayFormatted = dayjs().format("dddd, D [de] MMMM [de] YYYY");

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        {/* Welcome Banner */}
        <div className="animate-fade-slide-up relative overflow-hidden rounded-2xl border border-[#D08C32]/10 bg-gradient-to-br from-[#D08C32]/8 via-[#D3AB32]/5 to-[#FFF9F3] p-6 shadow-luxury md:p-8">
          {/* Refined decorative elements */}
          <div className="animate-float absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-[#D08C32]/8 to-[#D3AB32]/6" />
          <div className="animate-float absolute -right-5 top-12 h-28 w-28 rounded-full bg-gradient-to-br from-[#D3AB32]/8 to-[#D08C32]/4" style={{ animationDelay: "1s" }} />
          <div className="animate-pulse-soft absolute left-1/3 -top-6 h-20 w-20 rounded-full bg-[#D08C32]/4" />
          <div className="animate-float absolute left-10 bottom-0 h-16 w-16 rounded-full bg-[#D3AB32]/5" style={{ animationDelay: "2s" }} />

          {/* Subtle gold line accent at top */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#D08C32]/20 to-transparent" />

          <div className="relative flex items-center justify-between">
            <div className="space-y-2.5">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {greeting}, <span className="text-gradient">{firstName}</span>!
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Acompanhe seus procedimentos e resultados
              </p>
              <div className="flex items-center gap-2 text-xs md:text-sm">
                {clinicName && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D08C32]/8 px-3 py-0.5 text-[#D08C32] font-medium">
                    {clinicName}
                  </span>
                )}
                <span className="text-muted-foreground capitalize">{todayFormatted}</span>
              </div>
            </div>
            <DatePicker />
          </div>
        </div>

        <PageContent>
          {/* Stats Cards */}
          <div className="animate-fade-slide-up delay-1">
            <StatsCards
              totalRevenue={
                totalRevenue.total ? Number(totalRevenue.total) : null
              }
              totalAppointments={totalAppointments.total}
              totalPatients={totalPatients.total}
              activeConversations={activeConversations.total}
            />
          </div>

          {/* Row 1: Charts */}
          <div className="animate-fade-slide-up delay-2 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <AppointmentsChart dailyAppointmentsData={dailyAppointmentsData} />
            <AppointmentsStatusChart data={appointmentsByStatus} />
          </div>

          {/* Row 2: Funnel Overview */}
          <div className="animate-fade-slide-up delay-2">
            <FunnelOverview data={leadsByStage} />
          </div>

          {/* Row 3: Leads Source + Traffic + Conversion */}
          <div className="animate-fade-slide-up delay-3 grid grid-cols-1 gap-4 md:grid-cols-3">
            <LeadsSourceDonut data={leadsBySource} />
            <TrafficSummary data={metaAdsData} />
            <ConversionMetrics
              totalPatients={totalPatientsAll}
              recentLeads={recentLeadsTotal}
              totalAppointments={totalAppointments.total}
              completedAppointments={completedAppointments}
            />
          </div>

          {/* Row 4: Activities + Calendar */}
          <div className="animate-fade-slide-up delay-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <RecentActivities activities={recentActivities} />
            <MiniCalendar appointmentDates={appointmentDates} />
          </div>

          {/* Row 5: Upcoming */}
          <div className="animate-fade-slide-up delay-4">
            <UpcomingAppointments appointments={upcomingAppointments} />
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default DashboardPage;
