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
import ProcedureCard from "./_components/procedure-card";

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
          {procedures.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
              <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold">
                Nenhum procedimento cadastrado
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Comece adicionando seus procedimentos para gerenciar preços,
                materiais e agendamentos.
              </p>
            </div>
          ) : (
            <div className="animate-fade-slide-up delay-1 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {procedures.map((procedure, index) => (
                <div
                  key={procedure.id}
                  className="animate-fade-slide-up"
                  style={{ animationDelay: `${(index + 1) * 75}ms` }}
                >
                  <ProcedureCard
                    procedure={procedure}
                    stockItems={stockItems}
                  />
                </div>
              ))}
            </div>
          )}
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default ProceduresPage;
