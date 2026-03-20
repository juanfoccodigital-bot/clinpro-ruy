"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EditIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { deleteWhatsappConnection } from "@/actions/delete-whatsapp-connection";
import { upsertWhatsappConnection } from "@/actions/upsert-whatsapp-connection";
import {
  UpsertWhatsappConnectionSchema,
  upsertWhatsappConnectionSchema,
} from "@/actions/upsert-whatsapp-connection/schema";
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

import { WhatsappConnection } from "./connections-view";

interface ConnectionsTableActionsProps {
  connection: WhatsappConnection;
}

const ConnectionsTableActions = ({
  connection,
}: ConnectionsTableActionsProps) => {
  const [editDialogIsOpen, setEditDialogIsOpen] = useState(false);

  const form = useForm<UpsertWhatsappConnectionSchema>({
    shouldUnregister: true,
    resolver: zodResolver(upsertWhatsappConnectionSchema),
    defaultValues: {
      id: connection.id,
      instanceName: connection.instanceName,
      apiUrl: connection.apiUrl,
      apiKey: connection.apiKey,
      phoneNumber: connection.phoneNumber ?? "",
    },
  });

  useEffect(() => {
    if (editDialogIsOpen) {
      form.reset({
        id: connection.id,
        instanceName: connection.instanceName,
        apiUrl: connection.apiUrl,
        apiKey: connection.apiKey,
        phoneNumber: connection.phoneNumber ?? "",
      });
    }
  }, [editDialogIsOpen, form, connection]);

  const upsertAction = useAction(upsertWhatsappConnection, {
    onSuccess: () => {
      toast.success("Conexao atualizada com sucesso.");
      setEditDialogIsOpen(false);
    },
    onError: () => {
      toast.error("Erro ao atualizar conexao.");
    },
  });

  const deleteAction = useAction(deleteWhatsappConnection, {
    onSuccess: () => {
      toast.success("Conexao excluida com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao excluir conexao.");
    },
  });

  const onSubmit = (values: UpsertWhatsappConnectionSchema) => {
    upsertAction.execute({
      ...values,
      id: connection.id,
    });
  };

  const handleDeleteClick = () => {
    deleteAction.execute({ id: connection.id });
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
            <DropdownMenuLabel>{connection.instanceName}</DropdownMenuLabel>
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
                    Tem certeza que deseja excluir esta conexao?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa acao nao pode ser revertida. A conexao com a Evolution
                    API sera excluida permanentemente e todas as mensagens
                    associadas serao perdidas.
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
            <DialogTitle>Editar Conexao WhatsApp</DialogTitle>
            <DialogDescription>
              Atualize as informacoes da conexao com a Evolution API.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="instanceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Instancia</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: clinica-principal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da API</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://api.evolution.exemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave da API</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Sua chave de acesso"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="5511999999999" {...field} />
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

export default ConnectionsTableActions;
