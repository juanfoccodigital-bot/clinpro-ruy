"use client";

import { TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { deleteTimeRecord } from "@/actions/delete-time-record";
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
import { timeTrackingTable } from "@/db/schema";

interface TimeRecordTableActionsProps {
  timeRecord: typeof timeTrackingTable.$inferSelect;
}

const TimeRecordTableActions = ({
  timeRecord,
}: TimeRecordTableActionsProps) => {
  const deleteTimeRecordAction = useAction(deleteTimeRecord, {
    onSuccess: () => {
      toast.success("Registro de ponto deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar registro de ponto.");
    },
  });

  const handleDeleteClick = () => {
    deleteTimeRecordAction.execute({ id: timeRecord.id });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja deletar esse registro?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Essa acao nao pode ser revertida. Isso ira deletar o registro de
            ponto permanentemente.
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
  );
};

export default TimeRecordTableActions;
