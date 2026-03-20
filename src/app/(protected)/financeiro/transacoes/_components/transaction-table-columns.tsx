"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import {
  financialTransactionsTable,
  patientsTable,
} from "@/db/schema";

import TransactionTableActions from "./transaction-table-actions";

type Transaction = typeof financialTransactionsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect | null;
};

const typeLabels: Record<string, string> = {
  income: "Receita",
  expense: "Despesa",
};

const typeBadgeClasses: Record<string, string> = {
  income: "bg-green-100 text-green-800 border-green-200",
  expense: "bg-red-100 text-red-800 border-red-200",
};

const categoryLabels: Record<string, string> = {
  consultation: "Procedimento",
  exam: "Exame",
  procedure: "Procedimento",
  medication: "Medicamento",
  salary: "Salario",
  rent: "Aluguel",
  utilities: "Contas",
  supplies: "Materiais",
  equipment: "Equipamento",
  marketing: "Marketing",
  taxes: "Impostos",
  insurance: "Seguro",
  maintenance: "Manutencao",
  other: "Outros",
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

const formatCurrency = (amountInCents: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountInCents / 100);
};

interface CreateTransactionTableColumnsProps {
  patients: (typeof patientsTable.$inferSelect)[];
}

export const createTransactionTableColumns = ({
  patients,
}: CreateTransactionTableColumnsProps): ColumnDef<Transaction>[] => [
  {
    id: "description",
    accessorKey: "description",
    header: "Descricao",
  },
  {
    id: "type",
    accessorKey: "type",
    header: "Tipo",
    cell: (params) => {
      const transaction = params.row.original;
      const label = typeLabels[transaction.type] ?? transaction.type;
      const badgeClass = typeBadgeClasses[transaction.type] ?? "";
      return (
        <Badge variant="outline" className={badgeClass}>
          {label}
        </Badge>
      );
    },
  },
  {
    id: "category",
    accessorKey: "category",
    header: "Categoria",
    cell: (params) => {
      const transaction = params.row.original;
      const label =
        categoryLabels[transaction.category] ?? transaction.category;
      return <Badge variant="outline">{label}</Badge>;
    },
  },
  {
    id: "amountInCents",
    accessorKey: "amountInCents",
    header: "Valor",
    cell: (params) => {
      const transaction = params.row.original;
      return formatCurrency(transaction.amountInCents);
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: (params) => {
      const transaction = params.row.original;
      const label = statusLabels[transaction.status] ?? transaction.status;
      const badgeClass = statusBadgeClasses[transaction.status] ?? "";
      return (
        <Badge variant="outline" className={badgeClass}>
          {label}
        </Badge>
      );
    },
  },
  {
    id: "dueDate",
    accessorKey: "dueDate",
    header: "Vencimento",
    cell: (params) => {
      const transaction = params.row.original;
      if (!transaction.dueDate) return "-";
      return format(new Date(transaction.dueDate), "dd/MM/yyyy");
    },
  },
  {
    id: "patient",
    header: "Paciente",
    cell: (params) => {
      const transaction = params.row.original;
      return transaction.patient?.name ?? "-";
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const transaction = params.row.original;
      return (
        <TransactionTableActions
          transaction={transaction}
          patients={patients}
        />
      );
    },
  },
];
