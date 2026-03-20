"use client";

import {
  DollarSignIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const categoryLabels: Record<string, string> = {
  consultation: "Procedimento",
  exam: "Exame",
  procedure: "Procedimento",
  medication: "Medicamento",
  salary: "Salario",
  rent: "Aluguel",
  utilities: "Utilidades",
  supplies: "Materiais",
  equipment: "Equipamento",
  marketing: "Marketing",
  taxes: "Impostos",
  insurance: "Seguro",
  maintenance: "Manutencao",
  other: "Outros",
};

const paymentMethodLabels: Record<string, string> = {
  cash: "Dinheiro",
  credit_card: "Cartao de Credito",
  debit_card: "Cartao de Debito",
  pix: "PIX",
  bank_transfer: "Transferencia Bancaria",
  health_insurance: "Convenio",
  other: "Outros",
};

const formatCurrency = (valueInCents: number) => {
  return (valueInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

interface CategoryItem {
  category: string;
  total: number;
}

interface PaymentMethodItem {
  paymentMethod: string | null;
  total: number;
}

interface FinancialReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  byCategory: CategoryItem[];
  byPaymentMethod: PaymentMethodItem[];
}

interface FinancialReportViewProps {
  data: FinancialReportData;
}

const FinancialReportView = ({ data }: FinancialReportViewProps) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas pagas no periodo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDownIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Despesas pagas no periodo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lucro Liquido
            </CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${data.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(data.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas menos despesas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receita por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byCategory.length > 0 ? (
                  data.byCategory.map((item) => (
                    <TableRow key={item.category}>
                      <TableCell className="font-medium">
                        {categoryLabels[item.category] ?? item.category}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      Nenhuma receita encontrada no periodo.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Revenue by Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Receita por Forma de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Forma de Pagamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byPaymentMethod.length > 0 ? (
                  data.byPaymentMethod.map((item) => (
                    <TableRow key={item.paymentMethod ?? "unknown"}>
                      <TableCell className="font-medium">
                        {item.paymentMethod
                          ? (paymentMethodLabels[item.paymentMethod] ??
                            item.paymentMethod)
                          : "Nao informado"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      Nenhuma receita encontrada no periodo.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialReportView;
