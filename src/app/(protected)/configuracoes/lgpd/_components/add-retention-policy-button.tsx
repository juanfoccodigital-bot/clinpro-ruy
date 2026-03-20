"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { upsertDataRetentionPolicy } from "@/actions/upsert-data-retention-policy";
import {
  UpsertDataRetentionPolicySchema,
  upsertDataRetentionPolicySchema,
} from "@/actions/upsert-data-retention-policy/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const AddRetentionPolicyButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<UpsertDataRetentionPolicySchema>({
    shouldUnregister: true,
    resolver: zodResolver(upsertDataRetentionPolicySchema),
    defaultValues: {
      dataType: "",
      retentionDays: 365,
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        dataType: "",
        retentionDays: 365,
        description: "",
        isActive: true,
      });
    }
  }, [isOpen, form]);

  const upsertAction = useAction(upsertDataRetentionPolicy, {
    onSuccess: () => {
      toast.success("Politica de retencao salva com sucesso.");
      setIsOpen(false);
    },
    onError: () => {
      toast.error("Erro ao salvar politica de retencao.");
    },
  });

  const onSubmit = (values: UpsertDataRetentionPolicySchema) => {
    upsertAction.execute(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Adicionar Politica
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Politica de Retencao</DialogTitle>
          <DialogDescription>
            Defina uma nova politica de retencao de dados para a clinica.
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
  );
};

export default AddRetentionPolicyButton;
