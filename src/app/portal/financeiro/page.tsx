import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPatientFinancials } from "@/data/get-portal-data";
import { getPortalSession } from "@/lib/portal-auth";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Vencido",
  cancelled: "Cancelado",
};

const statusBadgeColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountInCents / 100);
}

export default async function PortalFinanceiroPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const transactions = await getPatientFinancials({
    patientId: session.patient.id,
    clinicId: session.patientUser.clinicId,
  });

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/portal">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Financeiro</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Minhas Transacoes</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhuma transacao encontrada.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descricao</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>{formatCurrency(tx.amountInCents)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusBadgeColors[tx.status] || ""}
                      >
                        {statusLabels[tx.status] || tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tx.dueDate
                        ? dayjs(tx.dueDate).format("DD/MM/YYYY")
                        : "--"}
                    </TableCell>
                    <TableCell>
                      {tx.paymentDate
                        ? dayjs(tx.paymentDate).format("DD/MM/YYYY")
                        : "--"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
