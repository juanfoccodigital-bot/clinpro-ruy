"use client";

import { EditIcon, ListIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteStockItem } from "@/actions/delete-stock-item";
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
import { stockItemsTable } from "@/db/schema";

import UpsertStockItemForm from "./upsert-stock-item-form";

interface StockTableActionsProps {
  stockItem: typeof stockItemsTable.$inferSelect;
}

const StockTableActions = ({ stockItem }: StockTableActionsProps) => {
  const [upsertDialogIsOpen, setUpsertDialogIsOpen] = useState(false);

  const deleteStockItemAction = useAction(deleteStockItem, {
    onSuccess: () => {
      toast.success("Item de estoque deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar item de estoque.");
    },
  });

  const handleDeleteClick = () => {
    if (!stockItem) return;
    deleteStockItemAction.execute({ id: stockItem.id });
  };

  return (
    <>
      <Dialog
        open={upsertDialogIsOpen}
        onOpenChange={setUpsertDialogIsOpen}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{stockItem.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/estoque/${stockItem.id}`}>
                <ListIcon />
                Movimentacoes
              </Link>
            </DropdownMenuItem>
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
                    Tem certeza que deseja deletar esse item?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa acao nao pode ser revertida. Isso ira deletar o item de
                    estoque e todas as suas movimentacoes permanentemente.
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

        <UpsertStockItemForm
          isOpen={upsertDialogIsOpen}
          stockItem={stockItem}
          onSuccess={() => setUpsertDialogIsOpen(false)}
        />
      </Dialog>
    </>
  );
};

export default StockTableActions;
