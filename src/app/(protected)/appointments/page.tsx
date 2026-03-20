import { eq } from "drizzle-orm";
import { CalendarDays } from "lucide-react";
import { headers } from "next/headers";

import { DataTable } from "@/components/ui/data-table";
import {
  PageBanner,
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { appointmentsTable, patientsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddAppointmentButton from "./_components/add-appointment-button";
import { appointmentsTableColumns } from "./_components/table-columns";

const AppointmentsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const [patients, appointments] = await Promise.all([
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session!.user.clinic!.id),
    }),
    db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.clinicId, session!.user.clinic!.id),
      with: {
        patient: true,
      },
    }),
  ]);

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageBanner
          icon={CalendarDays}
          title="Agenda de Procedimentos"
          description="Gerencie os procedimentos da sua clinica"
        >
          <AddAppointmentButton patients={patients} />
        </PageBanner>
        <PageContent>
          <div className="animate-fade-slide-up delay-1">
            <DataTable data={appointments} columns={appointmentsTableColumns} />
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default AppointmentsPage;
