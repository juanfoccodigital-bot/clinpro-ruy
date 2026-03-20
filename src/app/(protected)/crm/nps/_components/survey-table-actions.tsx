"use client";

import { MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { deleteSatisfactionSurvey } from "@/actions/delete-satisfaction-survey";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { satisfactionSurveysTable } from "@/db/schema";

interface SurveyTableActionsProps {
  survey: typeof satisfactionSurveysTable.$inferSelect;
}

const SurveyTableActions = ({ survey }: SurveyTableActionsProps) => {
  const deleteSurveyAction = useAction(deleteSatisfactionSurvey, {
    onSuccess: () => {
      toast.success("Pesquisa de satisfacao deletada com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar pesquisa de satisfacao.");
    },
  });

  const handleDeleteClick = () => {
    if (!survey) return;
    deleteSurveyAction.execute({ id: survey.id });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVerticalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Acoes</DropdownMenuLabel>
        <DropdownMenuSeparator />
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
                Tem certeza que deseja deletar essa pesquisa?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Essa acao nao pode ser revertida. Isso ira deletar a pesquisa
                de satisfacao permanentemente.
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
  );
};

export default SurveyTableActions;
