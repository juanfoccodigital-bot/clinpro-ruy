"use client";

import { EditIcon, MoreVerticalIcon, SendIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteCampaign } from "@/actions/delete-campaign";
import { sendCampaign } from "@/actions/send-campaign";
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
import { campaignsTable } from "@/db/schema";

import UpsertCampaignForm from "./upsert-campaign-form";

interface CampaignTableActionsProps {
  campaign: typeof campaignsTable.$inferSelect;
}

const CampaignTableActions = ({ campaign }: CampaignTableActionsProps) => {
  const [upsertDialogIsOpen, setUpsertDialogIsOpen] = useState(false);

  const deleteCampaignAction = useAction(deleteCampaign, {
    onSuccess: () => {
      toast.success("Campanha deletada com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar campanha.");
    },
  });

  const sendCampaignAction = useAction(sendCampaign, {
    onSuccess: () => {
      toast.success("Campanha enviada com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao enviar campanha.");
    },
  });

  const handleDeleteClick = () => {
    if (!campaign) return;
    deleteCampaignAction.execute({ id: campaign.id });
  };

  const handleSendClick = () => {
    if (!campaign) return;
    sendCampaignAction.execute({ id: campaign.id });
  };

  const canSend = campaign.status === "draft" || campaign.status === "scheduled";

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
            <DropdownMenuLabel>{campaign.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setUpsertDialogIsOpen(true)}>
              <EditIcon />
              Editar
            </DropdownMenuItem>
            {canSend && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <SendIcon />
                    Enviar
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Tem certeza que deseja enviar essa campanha?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      A campanha sera enviada para todos os destinatarios
                      cadastrados. Essa acao nao pode ser revertida.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSendClick}>
                      Enviar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
                    Tem certeza que deseja deletar essa campanha?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa acao nao pode ser revertida. Isso ira deletar a campanha
                    e todos os seus destinatarios permanentemente.
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

        <UpsertCampaignForm
          isOpen={upsertDialogIsOpen}
          campaign={campaign}
          onSuccess={() => setUpsertDialogIsOpen(false)}
        />
      </Dialog>
    </>
  );
};

export default CampaignTableActions;
