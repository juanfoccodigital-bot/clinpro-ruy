"use client";

import {
  CheckCircleIcon,
  EditIcon,
  MoreVerticalIcon,
  TrashIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteTransaction } from "@/actions/delete-transaction";
import { markTransactionPaid } from "@/actions/mark-transaction-paid";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  financialTransactionsTable,
  patientsTable,
} from "@/db/schema";

import UpsertTransactionForm from "./upsert-transaction-form";

interface TransactionTableActionsProps {
  transaction: typeof financialTransactionsTable.$inferSelect & {
    patient: typeof patientsTable.$inferSelect | null;
  };
  patients: (typeof patientsTable.$inferSelect)[];
}

const TransactionTableActions = ({
  transaction,
  patients,
}: TransactionTableActionsProps) => {
  const [upsertDialogIsOpen, setUpsertDialogIsOpen] = useState(false);

  const deleteTransactionAction = useAction(deleteTransaction, {
    onSuccess: () => {
      toast.success("Transacao deletada com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar transacao.");
    },
  });

  const markPaidAction = useAction(markTransactionPaid, {
    onSuccess: () => {
      toast.success("Transacao marcada como paga.");
    },
    onError: () => {
      toast.error("Erro ao marcar transacao como paga.");
    },
  });

  const handleDeleteClick = () => {
    if (!transaction) return;
    deleteTransactionAction.execute({ id: transaction.id });
  };

  const handleMarkPaidClick = () => {
    if (!transaction) return;
    markPaidAction.execute({ id: transaction.id });
  };

  return (
    <>
      <Dialog open={upsertDialogIsOpen} onOpenChange={setUpsertDialogIsOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{transaction.description}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {transaction.status !== "paid" && (
              <DropdownMenuItem onClick={handleMarkPaidClick}>
                <CheckCircleIcon />
                Marcar como Pago
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setUpsertDialogIsOpen(true)}>
              <EditIcon />
              Editar
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <TrashIcon />
                  Excluir
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Tem certeza que deseja deletar essa transacao?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa acao nao pode ser revertida. Isso ira deletar a
                    transacao permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteClick}>
                    Deletar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>

        <UpsertTransactionForm
          isOpen={upsertDialogIsOpen}
          transaction={transaction}
          patients={patients}
          onSuccess={() => setUpsertDialogIsOpen(false)}
        />
      </Dialog>
    </>
  );
};

export default TransactionTableActions;
