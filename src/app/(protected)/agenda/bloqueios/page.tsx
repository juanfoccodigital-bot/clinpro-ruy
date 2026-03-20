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
  doctorScheduleBlocksTable,
} from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddBlockButton from "./_components/add-block-button";
import BlockDataTable from "./_components/block-data-table";

const ScheduleBlocksPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const scheduleBlocks = await db.query.doctorScheduleBlocksTable.findMany({
    where: eq(doctorScheduleBlocksTable.clinicId, clinicId),
  });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Bloqueios de Horario</PageTitle>
            <PageDescription>
              Gerencie os bloqueios de horario da sua clinica
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddBlockButton />
          </PageActions>
        </PageHeader>
        <PageContent>
          <BlockDataTable data={scheduleBlocks} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default ScheduleBlocksPage;
