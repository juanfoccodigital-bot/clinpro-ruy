"use client";

import { EditIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteScheduleBlock } from "@/actions/delete-schedule-block";
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
import { doctorScheduleBlocksTable } from "@/db/schema";

import UpsertBlockForm from "./upsert-block-form";

interface BlockTableActionsProps {
  block: typeof doctorScheduleBlocksTable.$inferSelect;
}

const BlockTableActions = ({ block }: BlockTableActionsProps) => {
  const [upsertDialogIsOpen, setUpsertDialogIsOpen] = useState(false);

  const deleteAction = useAction(deleteScheduleBlock, {
    onSuccess: () => {
      toast.success("Bloqueio removido com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao remover bloqueio.");
    },
  });

  const handleDeleteClick = () => {
    if (!block) return;
    deleteAction.execute({ id: block.id });
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
            <DropdownMenuLabel>{block.title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
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
                    Tem certeza que deseja remover esse bloqueio?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa acao nao pode ser revertida. Isso ira remover o
                    bloqueio de horario permanentemente.
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

        <UpsertBlockForm
          isOpen={upsertDialogIsOpen}
          block={block}
          onSuccess={() => setUpsertDialogIsOpen(false)}
        />
      </Dialog>
    </>
  );
};

export default BlockTableActions;
