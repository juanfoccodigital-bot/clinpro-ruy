import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageContainer, PageContent } from "@/components/ui/page-container";
import { getDashboard } from "@/data/get-dashboard";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AppointmentsChart from "./_components/appointments-chart";
import AppointmentsStatusChart from "./_components/appointments-status-chart";
import { DatePicker } from "./_components/date-picker";
import MiniCalendar from "./_components/mini-calendar";
import RecentActivities from "./_components/recent-activities";
import StatsCards from "./_components/stats-cards";
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
    // topDoctors,
    // topSpecialties,
    dailyAppointmentsData,
    appointmentsByStatus,
    recentActivities,
    upcomingAppointments,
    appointmentDates,
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

  const greeting = getGreeting();
  const firstName = session.user.name?.split(" ")[0] || "Usuário";
  const clinicName = session.user.clinic?.name;
  const todayFormatted = dayjs().format("dddd, D [de] MMMM [de] YYYY");

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        {/* Welcome Banner */}
        <div className="animate-fade-slide-up relative overflow-hidden rounded-2xl border border-amber-500/10 bg-gradient-to-br from-amber-500/10 via-yellow-600/5 to-amber-500/5 p-6 md:p-8">
          {/* Animated decorative elements */}
          <div className="animate-float absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-amber-500/10 to-yellow-600/10" />
          <div className="animate-float absolute -right-5 top-12 h-28 w-28 rounded-full bg-gradient-to-br from-yellow-600/10 to-amber-500/5" style={{ animationDelay: "1s" }} />
          <div className="animate-pulse-soft absolute left-1/3 -top-6 h-20 w-20 rounded-full bg-amber-500/5" />
          <div className="animate-float absolute left-10 bottom-0 h-16 w-16 rounded-full bg-yellow-600/5" style={{ animationDelay: "2s" }} />

          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {greeting}, <span className="text-gradient">{firstName}</span>!
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Acompanhe seus procedimentos e resultados
              </p>
              <p className="text-muted-foreground text-xs md:text-sm">
                {clinicName && (
                  <span className="text-foreground font-medium">{clinicName}</span>
                )}
                {clinicName && " · "}
                <span className="capitalize">{todayFormatted}</span>
              </p>
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

          {/* Charts */}
          <div className="animate-fade-slide-up delay-2 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <AppointmentsChart dailyAppointmentsData={dailyAppointmentsData} />
            <AppointmentsStatusChart data={appointmentsByStatus} />
          </div>

          {/* Activities */}
          <div className="animate-fade-slide-up delay-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <RecentActivities activities={recentActivities} />
            <MiniCalendar appointmentDates={appointmentDates} />
          </div>

          {/* Upcoming */}
          <div className="animate-fade-slide-up delay-4">
            <UpcomingAppointments appointments={upcomingAppointments} />
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default DashboardPage;
