"use client";

import { EditIcon, EyeIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteEmployee } from "@/actions/delete-employee";
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
import { employeesTable } from "@/db/schema";

import UpsertEmployeeForm from "./upsert-employee-form";

interface EmployeeTableActionsProps {
  employee: typeof employeesTable.$inferSelect;
}

const EmployeeTableActions = ({ employee }: EmployeeTableActionsProps) => {
  const [upsertDialogIsOpen, setUpsertDialogIsOpen] = useState(false);

  const deleteEmployeeAction = useAction(deleteEmployee, {
    onSuccess: () => {
      toast.success("Funcionario deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar funcionario.");
    },
  });

  const handleDeleteClick = () => {
    if (!employee) return;
    deleteEmployeeAction.execute({ id: employee.id });
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
            <DropdownMenuLabel>{employee.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/funcionarios/${employee.id}`}>
                <EyeIcon />
                Detalhes
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
                    Tem certeza que deseja deletar esse funcionario?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa acao nao pode ser revertida. Isso ira deletar o
                    funcionario e todos os seus registros permanentemente.
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

        <UpsertEmployeeForm
          isOpen={upsertDialogIsOpen}
          employee={employee}
          onSuccess={() => setUpsertDialogIsOpen(false)}
        />
      </Dialog>
    </>
  );
};

export default EmployeeTableActions;
