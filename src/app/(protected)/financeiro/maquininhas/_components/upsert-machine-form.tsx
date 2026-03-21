"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createPaymentMachine,
  updatePaymentMachine,
} from "@/actions/payment-machines";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { paymentMachinesTable } from "@/db/schema";

const formSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório."),
  provider: z.string().trim().min(1, "Operadora é obrigatória."),
  debitFee: z.string(),
  creditFee: z.string(),
  credit2xFee: z.string(),
  credit3xFee: z.string(),
  credit4xFee: z.string(),
  credit5xFee: z.string(),
  credit6xFee: z.string(),
  credit7_12xFee: z.string(),
  pixFee: z.string(),
});

interface UpsertMachineFormProps {
  isOpen: boolean;
  machine?: typeof paymentMachinesTable.$inferSelect;
  onSuccess?: () => void;
}

const feeFields = [
  { name: "debitFee" as const, label: "Débito (%)" },
  { name: "creditFee" as const, label: "Crédito 1x (%)" },
  { name: "credit2xFee" as const, label: "Crédito 2x (%)" },
  { name: "credit3xFee" as const, label: "Crédito 3x (%)" },
  { name: "credit4xFee" as const, label: "Crédito 4x (%)" },
  { name: "credit5xFee" as const, label: "Crédito 5x (%)" },
  { name: "credit6xFee" as const, label: "Crédito 6x (%)" },
  { name: "credit7_12xFee" as const, label: "Crédito 7-12x (%)" },
  { name: "pixFee" as const, label: "PIX (%)" },
] as const;

const UpsertMachineForm = ({
  machine,
  isOpen,
  onSuccess,
}: UpsertMachineFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: machine?.name ?? "",
      provider: machine?.provider ?? "",
      debitFee: machine?.debitFee ?? "0",
      creditFee: machine?.creditFee ?? "0",
      credit2xFee: machine?.credit2xFee ?? "0",
      credit3xFee: machine?.credit3xFee ?? "0",
      credit4xFee: machine?.credit4xFee ?? "0",
      credit5xFee: machine?.credit5xFee ?? "0",
      credit6xFee: machine?.credit6xFee ?? "0",
      credit7_12xFee: machine?.credit7_12xFee ?? "0",
      pixFee: machine?.pixFee ?? "0",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: machine?.name ?? "",
        provider: machine?.provider ?? "",
        debitFee: machine?.debitFee ?? "0",
        creditFee: machine?.creditFee ?? "0",
        credit2xFee: machine?.credit2xFee ?? "0",
        credit3xFee: machine?.credit3xFee ?? "0",
        credit4xFee: machine?.credit4xFee ?? "0",
        credit5xFee: machine?.credit5xFee ?? "0",
        credit6xFee: machine?.credit6xFee ?? "0",
        credit7_12xFee: machine?.credit7_12xFee ?? "0",
        pixFee: machine?.pixFee ?? "0",
      });
    }
  }, [isOpen, form, machine]);

  const createAction = useAction(createPaymentMachine, {
    onSuccess: () => {
      toast.success("Maquininha cadastrada com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao cadastrar maquininha.");
    },
  });

  const updateAction = useAction(updatePaymentMachine, {
    onSuccess: () => {
      toast.success("Maquininha atualizada com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao atualizar maquininha.");
    },
  });

  const isPending = createAction.isPending || updateAction.isPending;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (machine) {
      updateAction.execute({ ...values, id: machine.id });
    } else {
      createAction.execute(values);
    }
  };

  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {machine ? "Editar maquininha" : "Adicionar maquininha"}
        </DialogTitle>
        <DialogDescription>
          {machine
            ? "Edite as informações da maquininha."
            : "Cadastre uma nova maquininha de pagamento."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Maquininha Balcão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operadora</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Stone, Cielo, PagSeguro"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Taxas por modalidade
            </p>
            <div className="grid grid-cols-3 gap-3">
              {feeFields.map((feeField) => (
                <FormField
                  key={feeField.name}
                  control={form.control}
                  name={feeField.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        {feeField.label}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="99.99"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertMachineForm;
