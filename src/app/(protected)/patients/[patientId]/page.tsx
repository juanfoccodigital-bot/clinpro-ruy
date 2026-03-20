import { and, desc, eq } from "drizzle-orm";
import { ChevronLeftIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import {
  medicalAttachmentsTable,
  medicalRecordsTable,
  patientProfilesTable,
  patientsTable,
  vitalsTable,
} from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import PatientHeader from "./_components/patient-header";
import PatientTabs from "./_components/patient-tabs";

interface PatientDetailPageProps {
  params: Promise<{ patientId: string }>;
}

const PatientDetailPage = async ({ params }: PatientDetailPageProps) => {
  const { patientId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const patient = await db.query.patientsTable.findFirst({
    where: and(
      eq(patientsTable.id, patientId),
      eq(patientsTable.clinicId, clinicId),
    ),
  });

  if (!patient) {
    redirect("/patients");
  }

  const [profile, medicalRecords, vitals, attachments] =
    await Promise.all([
      db.query.patientProfilesTable.findFirst({
        where: and(
          eq(patientProfilesTable.patientId, patientId),
          eq(patientProfilesTable.clinicId, clinicId),
        ),
      }),
      db.query.medicalRecordsTable.findMany({
        where: and(
          eq(medicalRecordsTable.patientId, patientId),
          eq(medicalRecordsTable.clinicId, clinicId),
        ),
        orderBy: [desc(medicalRecordsTable.createdAt)],
        limit: 50,
      }),
      db.query.vitalsTable.findMany({
        where: and(
          eq(vitalsTable.patientId, patientId),
          eq(vitalsTable.clinicId, clinicId),
        ),
        orderBy: [desc(vitalsTable.createdAt)],
        limit: 20,
      }),
      db.query.medicalAttachmentsTable.findMany({
        where: and(
          eq(medicalAttachmentsTable.patientId, patientId),
          eq(medicalAttachmentsTable.clinicId, clinicId),
        ),
        orderBy: [desc(medicalAttachmentsTable.createdAt)],
      }),
    ]);

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild>
                <Link href="/patients">
                  <ChevronLeftIcon />
                </Link>
              </Button>
              <div>
                <PageTitle>{patient.name}</PageTitle>
                <PageDescription>
                  Ficha Clínica e informações do paciente
                </PageDescription>
              </div>
            </div>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <PatientHeader patient={patient} profile={profile ?? null} />
          <PatientTabs
            patient={patient}
            profile={profile ?? null}
            medicalRecords={medicalRecords}
            vitals={vitals}
            attachments={attachments}
          />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default PatientDetailPage;
