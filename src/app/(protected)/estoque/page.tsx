import { eq } from "drizzle-orm";
import { Package } from "lucide-react";
import { headers } from "next/headers";

import {
  PageBanner,
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { stockItemsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddStockItemButton from "./_components/add-stock-item-button";
import StockDataTable from "./_components/stock-data-table";

const EstoquePage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const items = await db.query.stockItemsTable.findMany({
    where: eq(stockItemsTable.clinicId, clinicId),
    orderBy: (table, { asc }) => [asc(table.name)],
  });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageBanner
          icon={Package}
          title="Estoque"
          description="Gerencie o estoque da sua clinica"
        >
          <AddStockItemButton />
        </PageBanner>
        <PageContent>
          <div className="animate-fade-slide-up delay-1">
            <StockDataTable data={items} />
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default EstoquePage;
