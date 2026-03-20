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
  financialTransactionsTable,
  patientsTable,
} from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddTransactionButton from "./_components/add-transaction-button";
import TransactionDataTable from "./_components/transaction-data-table";

const TransacoesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const transactions = await db.query.financialTransactionsTable.findMany({
    where: eq(financialTransactionsTable.clinicId, clinicId),
    with: {
      patient: true,
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, clinicId),
  });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Transacoes Financeiras</PageTitle>
            <PageDescription>
              Gerencie todas as receitas e despesas da sua clinica.
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddTransactionButton patients={patients} />
          </PageActions>
        </PageHeader>
        <PageContent>
          <TransactionDataTable
            data={transactions}
            patients={patients}
          />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default TransacoesPage;
