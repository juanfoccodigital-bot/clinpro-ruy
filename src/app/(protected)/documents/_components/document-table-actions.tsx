"use client";

import {
  EditIcon,
  ExternalLinkIcon,
  MoreVerticalIcon,
  TrashIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteDocument } from "@/actions/delete-document";
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
import { documentsTable, patientsTable } from "@/db/schema";

import UpsertDocumentForm from "./upsert-document-form";

interface DocumentTableActionsProps {
  document: typeof documentsTable.$inferSelect & {
    patient: typeof patientsTable.$inferSelect;
  };
  patients: (typeof patientsTable.$inferSelect)[];
}

const DocumentTableActions = ({
  document,
  patients,
}: DocumentTableActionsProps) => {
  const [upsertDialogIsOpen, setUpsertDialogIsOpen] = useState(false);

  const deleteDocumentAction = useAction(deleteDocument, {
    onSuccess: () => {
      toast.success("Documento deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar documento.");
    },
  });

  const handleDeleteDocumentClick = () => {
    if (!document) return;
    deleteDocumentAction.execute({ id: document.id });
  };

  const handleViewPdfClick = () => {
    window.open(`/api/documents/${document.id}/pdf`, "_blank");
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
            <DropdownMenuLabel>{document.title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleViewPdfClick}>
              <ExternalLinkIcon />
              Visualizar PDF
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
                    Tem certeza que deseja deletar esse documento?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser revertida. Isso irá deletar o
                    documento permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteDocumentClick}>
                    Deletar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>

        <UpsertDocumentForm
          isOpen={upsertDialogIsOpen}
          document={document}
          patients={patients}
          onSuccess={() => setUpsertDialogIsOpen(false)}
        />
      </Dialog>
    </>
  );
};

export default DocumentTableActions;
