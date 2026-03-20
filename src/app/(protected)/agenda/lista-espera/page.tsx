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
import {
  patientsTable,
  waitingListTable,
} from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddWaitingListButton from "./_components/add-waiting-list-button";
import WaitingListDataTable from "./_components/waiting-list-data-table";

const WaitingListPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const [waitingListItems, patients] = await Promise.all([
    db.query.waitingListTable.findMany({
      where: eq(waitingListTable.clinicId, clinicId),
      with: {
        patient: true,
      },
    }),
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, clinicId),
    }),
  ]);

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Lista de Espera</PageTitle>
            <PageDescription>
              Gerencie os pacientes na lista de espera da sua clinica
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddWaitingListButton patients={patients} />
          </PageActions>
        </PageHeader>
        <PageContent>
          <WaitingListDataTable
            data={waitingListItems}
            patients={patients}
          />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default WaitingListPage;
