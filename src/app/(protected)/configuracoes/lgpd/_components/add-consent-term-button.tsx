"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { upsertConsentTerm } from "@/actions/upsert-consent-term";
import {
  UpsertConsentTermSchema,
  upsertConsentTermSchema,
} from "@/actions/upsert-consent-term/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const typeLabels: Record<string, string> = {
  treatment: "Tratamento",
  data_sharing: "Compartilhamento de Dados",
  marketing: "Marketing",
  research: "Pesquisa",
  terms_of_use: "Termos de Uso",
  privacy_policy: "Politica de Privacidade",
};

const AddConsentTermButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<UpsertConsentTermSchema>({
    shouldUnregister: true,
    resolver: zodResolver(upsertConsentTermSchema),
    defaultValues: {
      patientId: "",
      type: undefined,
      version: "1.0",
      accepted: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        patientId: "",
        type: undefined,
        version: "1.0",
        accepted: false,
      });
    }
  }, [isOpen, form]);

  const upsertAction = useAction(upsertConsentTerm, {
    onSuccess: () => {
      toast.success("Termo de consentimento salvo com sucesso.");
      setIsOpen(false);
    },
    onError: () => {
      toast.error("Erro ao salvar termo de consentimento.");
    },
  });

  const onSubmit = (values: UpsertConsentTermSchema) => {
    upsertAction.execute(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Adicionar Termo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Termo de Consentimento</DialogTitle>
          <DialogDescription>
            Adicione um novo termo de consentimento para um paciente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID do Paciente</FormLabel>
                  <FormControl>
                    <Input placeholder="UUID do paciente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Consentimento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Versao</FormLabel>
                  <FormControl>
                    <Input placeholder="1.0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accepted"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel>Aceito</FormLabel>
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

export default AddConsentTermButton;
