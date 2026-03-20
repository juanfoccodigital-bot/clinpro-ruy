import { eq } from "drizzle-orm";
import { CalendarRange } from "lucide-react";
import { headers } from "next/headers";

import { PageBanner, PageContainer } from "@/components/ui/page-container";
import { db } from "@/db";
import {
  appointmentRemindersTable,
  appointmentsTable,
  doctorScheduleBlocksTable,
  doctorsTable,
  patientsTable,
} from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AgendaSidebar from "./_components/agenda-sidebar";
import CalendarView from "./_components/calendar-view";

const AgendaPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const [appointments, doctors, patients, scheduleBlocks, reminders] =
    await Promise.all([
      db.query.appointmentsTable.findMany({
        where: eq(appointmentsTable.clinicId, clinicId),
        with: {
          patient: true,
          doctor: true,
        },
      }),
      db.query.doctorsTable.findMany({
        where: eq(doctorsTable.clinicId, clinicId),
      }),
      db.query.patientsTable.findMany({
        where: eq(patientsTable.clinicId, clinicId),
      }),
      db.query.doctorScheduleBlocksTable.findMany({
        where: eq(doctorScheduleBlocksTable.clinicId, clinicId),
      }),
      db.query.appointmentRemindersTable.findMany({
        where: eq(appointmentRemindersTable.clinicId, clinicId),
      }),
    ]);

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageBanner
          icon={CalendarRange}
          title="Agenda"
          description="Visualize a agenda da clinica"
        />
        <div className="animate-fade-slide-up delay-1 flex gap-6">
          <div className="flex-1 overflow-hidden">
            <CalendarView
              appointments={appointments}
              doctors={doctors}
              patients={patients}
              scheduleBlocks={scheduleBlocks}
            />
          </div>
          <div className="hidden w-80 shrink-0 lg:block">
            <AgendaSidebar
              appointments={appointments}
              reminders={reminders}
            />
          </div>
        </div>
      </PageContainer>
    </WithAuthentication>
  );
};

export default AgendaPage;
