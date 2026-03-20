import { and, count, eq, ilike, or } from "drizzle-orm";
import { Contact } from "lucide-react";
import { headers } from "next/headers";

import {
  PageBanner,
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { patientsTable, whatsappMessagesTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";
import {
  getContactsWithStages,
  getPipelineStages,
} from "@/actions/crm-pipeline";

import {
  ContactRow,
} from "./_components/contacts-table-columns";
import CrmSummaryCards from "./_components/crm-summary-cards";
import CrmViewToggle from "./_components/crm-view-toggle";

interface CrmPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    view?: string;
  }>;
}

const CrmPage = async ({ searchParams }: CrmPageProps) => {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const view = params.view || "kanban";
  const perPage = 20;
  const offset = (page - 1) * perPage;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.clinic?.id) {
    return null;
  }
  const clinicId = session.user.clinic.id;

  // Build search condition
  const searchCondition = search
    ? or(
        ilike(patientsTable.name, `%${search}%`),
        ilike(patientsTable.phoneNumber, `%${search}%`),
      )
    : undefined;

  const whereClause = and(
    eq(patientsTable.clinicId, clinicId),
    searchCondition,
  );

  // Total count (always needed for stats, unfiltered)
  const [{ total: totalPatients }] = await db
    .select({ total: count() })
    .from(patientsTable)
    .where(eq(patientsTable.clinicId, clinicId));

  // Filtered count for pagination
  const [{ total: filteredCount }] = await db
    .select({ total: count() })
    .from(patientsTable)
    .where(whereClause);

  // For kanban: load all (with search filter)
  // For table: paginate
  const patients =
    view === "kanban"
      ? await db.query.patientsTable.findMany({
          where: whereClause,
          orderBy: (table, { desc }) => [desc(table.createdAt)],
        })
      : await db.query.patientsTable.findMany({
          where: whereClause,
          limit: perPage,
          offset,
          orderBy: (table, { desc }) => [desc(table.createdAt)],
        });

  const totalPages = Math.ceil(filteredCount / perPage);

  // Fetch unique WhatsApp phone numbers
  const whatsappPhones = await db
    .selectDistinctOn([whatsappMessagesTable.remotePhone], {
      remotePhone: whatsappMessagesTable.remotePhone,
      createdAt: whatsappMessagesTable.createdAt,
    })
    .from(whatsappMessagesTable)
    .where(eq(whatsappMessagesTable.clinicId, clinicId));

  const patientPhones = new Set(patients.map((p) => p.phoneNumber));

  // WhatsApp-only contacts (not already registered as patients)
  const whatsappOnlyContacts: ContactRow[] = whatsappPhones
    .filter((wp) => !patientPhones.has(wp.remotePhone))
    .map((wp) => ({
      id: `wa-${wp.remotePhone}`,
      name: wp.remotePhone.replace(
        /(\d{2})(\d{2})(\d{5})(\d{4})/,
        "+$1 ($2) $3-$4",
      ),
      email: "",
      phoneNumber: wp.remotePhone,
      source: "whatsapp" as const,
      createdAt: wp.createdAt,
    }));

  // Check which patients also have WhatsApp messages
  const whatsappPhoneSet = new Set(whatsappPhones.map((wp) => wp.remotePhone));

  // Build unified contacts list
  const contacts: ContactRow[] = [
    ...patients.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      phoneNumber: p.phoneNumber,
      source: whatsappPhoneSet.has(p.phoneNumber)
        ? ("whatsapp" as const)
        : ("manual" as const),
      createdAt: p.createdAt,
    })),
    ...whatsappOnlyContacts,
  ];

  // Stats (use totalPatients for unfiltered stats)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const whatsappCount = contacts.filter((c) => c.source === "whatsapp").length;
  const manualCount = contacts.filter((c) => c.source === "manual").length;
  const recentCount = contacts.filter(
    (c) => new Date(c.createdAt) >= thirtyDaysAgo,
  ).length;

  // Fetch pipeline data
  const [stages, contactsWithStages] = await Promise.all([
    getPipelineStages(),
    getContactsWithStages(),
  ]);

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageBanner
          icon={Contact}
          title="Contatos"
          description="Gerencie todos os contatos da sua clinica"
        />
        <PageContent>
          <div className="animate-fade-slide-up delay-1 space-y-6">
            <CrmSummaryCards
              totalContacts={totalPatients}
              whatsappContacts={whatsappCount}
              manualContacts={manualCount}
              recentContacts={recentCount}
            />
            <CrmViewToggle
              contacts={contacts}
              stages={stages}
              contactsWithStages={contactsWithStages}
              totalCount={filteredCount}
              currentPage={page}
              totalPages={totalPages}
              search={search}
              view={view}
            />
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default CrmPage;
