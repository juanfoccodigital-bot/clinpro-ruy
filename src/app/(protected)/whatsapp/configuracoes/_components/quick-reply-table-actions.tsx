"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EditIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { deleteQuickReply } from "@/actions/delete-quick-reply";
import { upsertQuickReply } from "@/actions/upsert-quick-reply";
import {
  UpsertQuickReplySchema,
  upsertQuickReplySchema,
} from "@/actions/upsert-quick-reply/schema";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { QuickReply } from "./quick-replies-view";

interface QuickReplyTableActionsProps {
  quickReply: QuickReply;
}

const QuickReplyTableActions = ({
  quickReply,
}: QuickReplyTableActionsProps) => {
  const [editDialogIsOpen, setEditDialogIsOpen] = useState(false);

  const form = useForm<UpsertQuickReplySchema>({
    shouldUnregister: true,
    resolver: zodResolver(upsertQuickReplySchema),
    defaultValues: {
      id: quickReply.id,
      shortcut: quickReply.shortcut,
      content: quickReply.content,
    },
  });

  useEffect(() => {
    if (editDialogIsOpen) {
      form.reset({
        id: quickReply.id,
        shortcut: quickReply.shortcut,
        content: quickReply.content,
      });
    }
  }, [editDialogIsOpen, form, quickReply]);

  const upsertAction = useAction(upsertQuickReply, {
    onSuccess: () => {
      toast.success("Resposta rapida atualizada com sucesso.");
      setEditDialogIsOpen(false);
    },
    onError: () => {
      toast.error("Erro ao atualizar resposta rapida.");
    },
  });

  const deleteAction = useAction(deleteQuickReply, {
    onSuccess: () => {
      toast.success("Resposta rapida excluida com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao excluir resposta rapida.");
    },
  });

  const onSubmit = (values: UpsertQuickReplySchema) => {
    upsertAction.execute({
      ...values,
      id: quickReply.id,
    });
  };

  const handleDeleteClick = () => {
    deleteAction.execute({ id: quickReply.id });
  };

  return (
    <>
      <Dialog open={editDialogIsOpen} onOpenChange={setEditDialogIsOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>/{quickReply.shortcut}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setEditDialogIsOpen(true)}>
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
                    Tem certeza que deseja excluir esta resposta rapida?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa acao nao pode ser revertida. A resposta rapida sera
                    excluida permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteClick}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Resposta Rapida</DialogTitle>
            <DialogDescription>
              Atualize o atalho e o conteudo da resposta rapida.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="shortcut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Atalho</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: saudacao, confirmar, cancelar"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteudo da Mensagem</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite o conteudo da resposta rapida..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={upsertAction.isPending}
                  className="w-full"
                >
                  {upsertAction.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickReplyTableActions;
