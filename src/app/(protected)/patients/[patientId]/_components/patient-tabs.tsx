"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  medicalAttachmentsTable,
  medicalRecordsTable,
  patientProfilesTable,
  patientsTable,
  vitalsTable,
} from "@/db/schema";

import AttachmentsList from "./attachments-list";
import MedicalRecordsTimeline from "./medical-records-timeline";
import PatientProfileForm from "./patient-profile-form";
import VitalsTable from "./vitals-table";

interface PatientTabsProps {
  patient: typeof patientsTable.$inferSelect;
  profile: typeof patientProfilesTable.$inferSelect | null;
  medicalRecords: (typeof medicalRecordsTable.$inferSelect)[];
  vitals: (typeof vitalsTable.$inferSelect)[];
  attachments: (typeof medicalAttachmentsTable.$inferSelect)[];
}

const PatientTabs = ({
  patient,
  profile,
  medicalRecords,
  vitals,
  attachments,
}: PatientTabsProps) => {
  return (
    <Tabs defaultValue="records" className="w-full">
      <TabsList>
        <TabsTrigger value="records">Ficha Clínica</TabsTrigger>
        <TabsTrigger value="vitals">Sinais Vitais</TabsTrigger>
        <TabsTrigger value="attachments">Anexos</TabsTrigger>
        <TabsTrigger value="profile">Dados Pessoais</TabsTrigger>
      </TabsList>

      <TabsContent value="records" className="mt-6">
        <MedicalRecordsTimeline
          patientId={patient.id}
          medicalRecords={medicalRecords}
        />
      </TabsContent>

      <TabsContent value="vitals" className="mt-6">
        <VitalsTable patientId={patient.id} vitals={vitals} />
      </TabsContent>

      <TabsContent value="attachments" className="mt-6">
        <AttachmentsList patientId={patient.id} attachments={attachments} />
      </TabsContent>

      <TabsContent value="profile" className="mt-6">
        <PatientProfileForm patientId={patient.id} profile={profile} />
      </TabsContent>
    </Tabs>
  );
};

export default PatientTabs;
