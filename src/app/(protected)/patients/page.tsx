import { and, count, eq, ilike, or } from "drizzle-orm";
import { UsersRound } from "lucide-react";
import { headers } from "next/headers";

import { DataTable } from "@/components/ui/data-table";
import {
  PageBanner,
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";
import { getTerminology } from "@/config/clinic-types";
import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddPatientButton from "./_components/add-patient-button";
import PatientsPagination from "./_components/patients-pagination";
import { patientsTableColumns } from "./_components/table-columns";

interface PatientsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

const PatientsPage = async ({ searchParams }: PatientsPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search || "";
  const perPage = 20;
  const offset = (page - 1) * perPage;

  const clinicId = session!.user.clinic!.id;

  const whereClause = and(
    eq(patientsTable.clinicId, clinicId),
    search
      ? or(
          ilike(patientsTable.name, `%${search}%`),
          ilike(patientsTable.phoneNumber, `%${search}%`),
        )
      : undefined,
  );

  const [{ total }] = await db
    .select({ total: count() })
    .from(patientsTable)
    .where(whereClause);

  const patients = await db.query.patientsTable.findMany({
    where: whereClause,
    limit: perPage,
    offset,
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const terms = getTerminology(session!.user.clinic?.clinicType);

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageBanner
          icon={UsersRound}
          title={terms.patients}
          description={`Gerencie os ${terms.patients.toLowerCase()} da sua clinica`}
        >
          <AddPatientButton />
        </PageBanner>
        <PageContent>
          <div className="animate-fade-slide-up delay-1 space-y-4">
            <PatientsPagination
              page={page}
              totalPages={totalPages}
              total={total}
              search={search}
            />
            <DataTable data={patients} columns={patientsTableColumns} />
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default PatientsPage;
