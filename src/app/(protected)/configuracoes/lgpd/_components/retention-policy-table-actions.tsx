"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EditIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { deleteDataRetentionPolicy } from "@/actions/delete-data-retention-policy";
import { upsertDataRetentionPolicy } from "@/actions/upsert-data-retention-policy";
import {
  UpsertDataRetentionPolicySchema,
  upsertDataRetentionPolicySchema,
} from "@/actions/upsert-data-retention-policy/schema";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { RetentionPolicy } from "./retention-policies-view";

interface RetentionPolicyTableActionsProps {
  policy: RetentionPolicy;
}

const RetentionPolicyTableActions = ({
  policy,
}: RetentionPolicyTableActionsProps) => {
  const [editDialogIsOpen, setEditDialogIsOpen] = useState(false);

  const form = useForm<UpsertDataRetentionPolicySchema>({
    shouldUnregister: true,
    resolver: zodResolver(upsertDataRetentionPolicySchema),
    defaultValues: {
      id: policy.id,
      dataType: policy.dataType,
      retentionDays: policy.retentionDays,
      description: policy.description ?? "",
      isActive: policy.isActive,
    },
  });

  useEffect(() => {
    if (editDialogIsOpen) {
      form.reset({
        id: policy.id,
        dataType: policy.dataType,
        retentionDays: policy.retentionDays,
        description: policy.description ?? "",
        isActive: policy.isActive,
      });
    }
  }, [editDialogIsOpen, form, policy]);

  const upsertAction = useAction(upsertDataRetentionPolicy, {
    onSuccess: () => {
      toast.success("Politica de retencao atualizada com sucesso.");
      setEditDialogIsOpen(false);
    },
    onError: () => {
      toast.error("Erro ao atualizar politica de retencao.");
    },
  });

  const deleteAction = useAction(deleteDataRetentionPolicy, {
    onSuccess: () => {
      toast.success("Politica de retencao excluida com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao excluir politica de retencao.");
    },
  });

  const onSubmit = (values: UpsertDataRetentionPolicySchema) => {
    upsertAction.execute({
      ...values,
      id: policy.id,
    });
  };

  const handleDeleteClick = () => {
    deleteAction.execute({ id: policy.id });
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
            <DropdownMenuLabel>{policy.dataType}</DropdownMenuLabel>
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
                    Tem certeza que deseja excluir esta politica?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa acao nao pode ser revertida. A politica de retencao sera
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
            <DialogTitle>Editar Politica de Retencao</DialogTitle>
            <DialogDescription>
              Atualize as informacoes da politica de retencao de dados.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="dataType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Dado</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Fichas Clínicas, Exames, Documentos"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="retentionDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dias de Retencao</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="365"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descricao (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva a politica de retencao"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <FormLabel>Ativo</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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

export default RetentionPolicyTableActions;
