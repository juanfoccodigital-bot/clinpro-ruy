import { eq } from "drizzle-orm";
import { ClipboardList } from "lucide-react";
import { headers } from "next/headers";

import {
  PageBanner,
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { proceduresTable, stockItemsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddProcedureButton from "./_components/add-procedure-button";
import ProceduresTable from "./_components/procedures-table";

const ProceduresPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const clinicId = session!.user.clinic!.id;

  const procedures = await db.query.proceduresTable.findMany({
    where: eq(proceduresTable.clinicId, clinicId),
    with: {
      stockItems: {
        with: {
          stockItem: true,
        },
      },
    },
    orderBy: (procedures, { asc }) => [asc(procedures.name)],
  });

  const stockItems = await db.query.stockItemsTable.findMany({
    where: eq(stockItemsTable.clinicId, clinicId),
  });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageBanner
          icon={ClipboardList}
          title="Procedimentos"
          description="Gerencie o catálogo de procedimentos da sua clínica"
        >
          <AddProcedureButton stockItems={stockItems} />
        </PageBanner>
        <PageContent>
          <div className="animate-fade-slide-up delay-1">
            <ProceduresTable procedures={procedures} stockItems={stockItems} />
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default ProceduresPage;
