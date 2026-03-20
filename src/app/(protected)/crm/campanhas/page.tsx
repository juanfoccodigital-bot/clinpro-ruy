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
import { campaignsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddCampaignButton from "./_components/add-campaign-button";
import CampaignDataTable from "./_components/campaign-data-table";

const CampanhasPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const campaigns = await db.query.campaignsTable.findMany({
    where: eq(campaignsTable.clinicId, clinicId),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Campanhas</PageTitle>
            <PageDescription>
              Gerencie suas campanhas de marketing e comunicacao com pacientes.
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddCampaignButton />
          </PageActions>
        </PageHeader>
        <PageContent>
          <CampaignDataTable data={campaigns} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default CampanhasPage;
