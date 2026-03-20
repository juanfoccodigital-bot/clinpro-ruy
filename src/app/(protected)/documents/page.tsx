import { eq } from "drizzle-orm";
import { FileText } from "lucide-react";
import { headers } from "next/headers";

import {
  PageBanner,
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { documentsTable, patientsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddDocumentButton from "./_components/add-document-button";
import DocumentDataTable from "./_components/document-data-table";

const DocumentsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const documents = await db.query.documentsTable.findMany({
    where: eq(documentsTable.clinicId, clinicId),
    with: {
      patient: true,
    },
  });

  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, clinicId),
  });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageBanner
          icon={FileText}
          title="Documentos"
          description="Gerencie os documentos da sua clinica"
        >
          <AddDocumentButton patients={patients} />
        </PageBanner>
        <PageContent>
          <div className="animate-fade-slide-up delay-1">
            <DocumentDataTable
              data={documents}
              patients={patients}
            />
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default DocumentsPage;
