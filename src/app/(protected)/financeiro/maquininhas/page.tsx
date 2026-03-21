import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { paymentMachinesTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddMachineButton from "./_components/add-machine-button";
import MachinesList from "./_components/machines-list";

const MaquininhasPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const machines = await db.query.paymentMachinesTable.findMany({
    where: eq(paymentMachinesTable.clinicId, clinicId),
    orderBy: (table, { asc }) => [asc(table.name)],
  });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Maquininhas de Pagamento</PageTitle>
            <PageDescription>
              Gerencie suas maquininhas e taxas de cada operadora.
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddMachineButton />
          </PageActions>
        </PageHeader>
        <PageContent>
          <MachinesList machines={machines} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default MaquininhasPage;
