"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { upsertWhatsappConnection } from "@/actions/upsert-whatsapp-connection";
import {
  UpsertWhatsappConnectionSchema,
  upsertWhatsappConnectionSchema,
} from "@/actions/upsert-whatsapp-connection/schema";
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

const AddConnectionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<UpsertWhatsappConnectionSchema>({
    shouldUnregister: true,
    resolver: zodResolver(upsertWhatsappConnectionSchema),
    defaultValues: {
      instanceName: "",
      apiUrl: "",
      apiKey: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        instanceName: "",
        apiUrl: "",
        apiKey: "",
        phoneNumber: "",
      });
    }
  }, [isOpen, form]);

  const upsertAction = useAction(upsertWhatsappConnection, {
    onSuccess: () => {
      toast.success("Conexao WhatsApp salva com sucesso.");
      setIsOpen(false);
    },
    onError: () => {
      toast.error("Erro ao salvar conexao WhatsApp.");
    },
  });

  const onSubmit = (values: UpsertWhatsappConnectionSchema) => {
    upsertAction.execute(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nova Conexao
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Conexao WhatsApp</DialogTitle>
          <DialogDescription>
            Configure uma nova instancia da Evolution API para conectar ao
            WhatsApp.
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
  );
};

export default AddConnectionButton;
