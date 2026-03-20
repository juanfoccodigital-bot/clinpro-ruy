import { and, eq, gte, lt, sql } from "drizzle-orm";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageBanner,
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { financialTransactionsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

const formatCurrency = (amountInCents: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountInCents / 100);
};

const formatDate = (date: Date | null) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

const statusBadgeClasses: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  overdue: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
};

const typeLabels: Record<string, string> = {
  income: "Receita",
  expense: "Despesa",
};

const typeBadgeClasses: Record<string, string> = {
  income: "bg-green-100 text-green-800 border-green-200",
  expense: "bg-red-100 text-red-800 border-red-200",
};

const FinanceiroPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Total income this month (paid)
  const [incomeResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${financialTransactionsTable.amountInCents}), 0)`,
    })
    .from(financialTransactionsTable)
    .where(
      and(
        eq(financialTransactionsTable.clinicId, clinicId),
        eq(financialTransactionsTable.type, "income"),
        eq(financialTransactionsTable.status, "paid"),
        gte(financialTransactionsTable.paymentDate, startOfMonth),
        lt(financialTransactionsTable.paymentDate, startOfNextMonth),
      ),
    );

  // Total expenses this month (paid)
  const [expenseResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${financialTransactionsTable.amountInCents}), 0)`,
    })
    .from(financialTransactionsTable)
    .where(
      and(
        eq(financialTransactionsTable.clinicId, clinicId),
        eq(financialTransactionsTable.type, "expense"),
        eq(financialTransactionsTable.status, "paid"),
        gte(financialTransactionsTable.paymentDate, startOfMonth),
        lt(financialTransactionsTable.paymentDate, startOfNextMonth),
      ),
    );

  // Pending receivables (income pending)
  const [pendingReceivablesResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${financialTransactionsTable.amountInCents}), 0)`,
    })
    .from(financialTransactionsTable)
    .where(
      and(
        eq(financialTransactionsTable.clinicId, clinicId),
        eq(financialTransactionsTable.type, "income"),
        eq(financialTransactionsTable.status, "pending"),
      ),
    );

  // Pending payables (expense pending)
  const [pendingPayablesResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${financialTransactionsTable.amountInCents}), 0)`,
    })
    .from(financialTransactionsTable)
    .where(
      and(
        eq(financialTransactionsTable.clinicId, clinicId),
        eq(financialTransactionsTable.type, "expense"),
        eq(financialTransactionsTable.status, "pending"),
      ),
    );

  // Overdue count
  const [overdueResult] = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(financialTransactionsTable)
    .where(
      and(
        eq(financialTransactionsTable.clinicId, clinicId),
        eq(financialTransactionsTable.status, "overdue"),
      ),
    );

  const totalIncome = Number(incomeResult.total);
  const totalExpense = Number(expenseResult.total);
  const balance = totalIncome - totalExpense;
  const pendingReceivables = Number(pendingReceivablesResult.total);
  const pendingPayables = Number(pendingPayablesResult.total);
  const overdueCount = Number(overdueResult.count);

  // Recent transactions
  const recentTransactions =
    await db.query.financialTransactionsTable.findMany({
      where: eq(financialTransactionsTable.clinicId, clinicId),
      with: {
        patient: true,
      },
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 10,
    });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageBanner
          icon={WalletIcon}
          title="Financeiro"
          description="Visao geral das financas da sua clinica"
        >
          <div className="flex items-center gap-2">
            <Link href="/financeiro/transacoes">
              <Button variant="outline">
                Transacoes
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </PageBanner>
        <PageContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita do Mes
                </CardTitle>
                <TrendingUpIcon className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalIncome)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valores pagos no mes atual
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Despesas do Mes
                </CardTitle>
                <TrendingDownIcon className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalExpense)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Despesas pagas no mes atual
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                <WalletIcon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(balance)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Receitas menos despesas do mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Contas a Receber
                </CardTitle>
                <TrendingUpIcon className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(pendingReceivables)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Receitas pendentes de pagamento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Contas a Pagar
                </CardTitle>
                <TrendingDownIcon className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(pendingPayables)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Despesas pendentes de pagamento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
                <AlertTriangleIcon className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {overdueCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Transacoes com pagamento vencido
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Transacoes Recentes
                </CardTitle>
                <Link href="/financeiro/transacoes">
                  <Button variant="link" size="sm">
                    Ver todas
                    <ArrowRightIcon className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descricao</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Paciente</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              typeBadgeClasses[transaction.type] ?? ""
                            }
                          >
                            {typeLabels[transaction.type] ?? transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(transaction.amountInCents)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              statusBadgeClasses[transaction.status] ?? ""
                            }
                          >
                            {statusLabels[transaction.status] ??
                              transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(transaction.dueDate)}
                        </TableCell>
                        <TableCell>
                          {transaction.patient?.name ?? "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Nenhuma transacao encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default FinanceiroPage;
