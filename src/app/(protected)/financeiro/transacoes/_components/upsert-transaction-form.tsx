"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertTransaction } from "@/actions/upsert-transaction";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  financialTransactionsTable,
  patientsTable,
  paymentMachinesTable,
} from "@/db/schema";

type PaymentMachine = typeof paymentMachinesTable.$inferSelect;

const formSchema = z.object({
  type: z.enum(["income", "expense"], {
    required_error: "Tipo e obrigatorio.",
  }),
  category: z.enum(
    [
      "consultation",
      "exam",
      "procedure",
      "medication",
      "salary",
      "rent",
      "utilities",
      "supplies",
      "equipment",
      "marketing",
      "taxes",
      "insurance",
      "maintenance",
      "other",
    ],
    {
      required_error: "Categoria e obrigatoria.",
    },
  ),
  description: z.string().trim().min(1, {
    message: "Descricao e obrigatoria.",
  }),
  amountInReais: z
    .string()
    .min(1, { message: "Valor e obrigatorio." })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Valor deve ser maior que zero.",
    }),
  paymentMethod: z
    .enum([
      "cash",
      "credit_card",
      "debit_card",
      "pix",
      "bank_transfer",
      "health_insurance",
      "other",
    ])
    .optional(),
  status: z.enum(["pending", "paid", "overdue", "cancelled"], {
    required_error: "Status e obrigatorio.",
  }),
  dueDate: z.string().optional(),
  paymentDate: z.string().optional(),
  patientId: z.string().optional(),
  notes: z.string().optional(),
  paymentMachineId: z.string().optional(),
  installments: z.string().optional(),
});

function getFeePercentage(
  machine: PaymentMachine,
  paymentMethod: string,
  installments: number,
): number {
  if (paymentMethod === "debit_card") return Number(machine.debitFee);
  if (paymentMethod === "pix") return Number(machine.pixFee);
  if (paymentMethod === "credit_card") {
    if (installments <= 1) return Number(machine.creditFee);
    if (installments === 2) return Number(machine.credit2xFee);
    if (installments === 3) return Number(machine.credit3xFee);
    if (installments === 4) return Number(machine.credit4xFee);
    if (installments === 5) return Number(machine.credit5xFee);
    if (installments === 6) return Number(machine.credit6xFee);
    if (installments >= 7) return Number(machine.credit7_12xFee);
  }
  return 0;
}

interface UpsertTransactionFormProps {
  isOpen: boolean;
  transaction?: typeof financialTransactionsTable.$inferSelect;
  patients: (typeof patientsTable.$inferSelect)[];
  paymentMachines?: PaymentMachine[];
  onSuccess?: () => void;
}

const UpsertTransactionForm = ({
  transaction,
  patients,
  paymentMachines = [],
  onSuccess,
  isOpen,
}: UpsertTransactionFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: transaction?.type ?? undefined,
      category: transaction?.category ?? undefined,
      description: transaction?.description ?? "",
      amountInReais: transaction
        ? (transaction.amountInCents / 100).toFixed(2)
        : "",
      paymentMethod: transaction?.paymentMethod ?? undefined,
      status: transaction?.status ?? "pending",
      dueDate: transaction?.dueDate
        ? new Date(transaction.dueDate).toISOString().split("T")[0]
        : "",
      paymentDate: transaction?.paymentDate
        ? new Date(transaction.paymentDate).toISOString().split("T")[0]
        : "",
      patientId: transaction?.patientId ?? undefined,
      notes: transaction?.notes ?? "",
      paymentMachineId: transaction?.paymentMachineId ?? undefined,
      installments: transaction?.installments?.toString() ?? "1",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        type: transaction?.type ?? undefined,
        category: transaction?.category ?? undefined,
        description: transaction?.description ?? "",
        amountInReais: transaction
          ? (transaction.amountInCents / 100).toFixed(2)
          : "",
        paymentMethod: transaction?.paymentMethod ?? undefined,
        status: transaction?.status ?? "pending",
        dueDate: transaction?.dueDate
          ? new Date(transaction.dueDate).toISOString().split("T")[0]
          : "",
        paymentDate: transaction?.paymentDate
          ? new Date(transaction.paymentDate).toISOString().split("T")[0]
          : "",
        patientId: transaction?.patientId ?? undefined,
        notes: transaction?.notes ?? "",
        paymentMachineId: transaction?.paymentMachineId ?? undefined,
        installments: transaction?.installments?.toString() ?? "1",
      });
    }
  }, [isOpen, form, transaction]);

  const paymentMethod = useWatch({ control: form.control, name: "paymentMethod" });
  const paymentMachineId = useWatch({ control: form.control, name: "paymentMachineId" });
  const installmentsStr = useWatch({ control: form.control, name: "installments" });
  const amountInReais = useWatch({ control: form.control, name: "amountInReais" });

  const showMachineSelect =
    paymentMethod === "credit_card" ||
    paymentMethod === "debit_card" ||
    paymentMethod === "pix";

  const showInstallments = paymentMethod === "credit_card";

  const selectedMachine = useMemo(() => {
    if (!paymentMachineId) return null;
    return paymentMachines.find((m) => m.id === paymentMachineId) ?? null;
  }, [paymentMachineId, paymentMachines]);

  const feeCalc = useMemo(() => {
    if (!selectedMachine || !paymentMethod || !amountInReais) return null;
    const amount = Number(amountInReais);
    if (isNaN(amount) || amount <= 0) return null;
    const installments = Number(installmentsStr) || 1;
    const feePercent = getFeePercentage(selectedMachine, paymentMethod, installments);
    const feeAmountReais = (amount * feePercent) / 100;
    const netAmountReais = amount - feeAmountReais;
    return { feePercent, feeAmountReais, netAmountReais };
  }, [selectedMachine, paymentMethod, installmentsStr, amountInReais]);

  const upsertTransactionAction = useAction(upsertTransaction, {
    onSuccess: () => {
      toast.success("Transacao salva com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar transacao.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const amountInCents = Math.round(Number(values.amountInReais) * 100);
    const installments = Number(values.installments) || 1;

    let feePercentage: string | undefined;
    let feeAmount: number | undefined;
    let netAmount: number | undefined;

    if (feeCalc) {
      feePercentage = feeCalc.feePercent.toFixed(2);
      feeAmount = Math.round(feeCalc.feeAmountReais * 100);
      netAmount = Math.round(feeCalc.netAmountReais * 100);
    }

    upsertTransactionAction.execute({
      ...values,
      id: transaction?.id,
      amountInCents,
      installments,
      dueDate: values.dueDate || undefined,
      paymentDate: values.paymentDate || undefined,
      patientId: values.patientId || undefined,
      paymentMachineId: values.paymentMachineId || undefined,
      notes: values.notes || undefined,
      feePercentage,
      feeAmount,
      netAmount,
    });
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {transaction ? "Editar transacao" : "Adicionar transacao"}
        </DialogTitle>
        <DialogDescription>
          {transaction
            ? "Edite as informacoes dessa transacao."
            : "Adicione uma nova transacao financeira."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
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
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="consultation">Procedimento</SelectItem>
                      <SelectItem value="exam">Exame</SelectItem>
                      <SelectItem value="procedure">Procedimento</SelectItem>
                      <SelectItem value="medication">Medicamento</SelectItem>
                      <SelectItem value="salary">Salario</SelectItem>
                      <SelectItem value="rent">Aluguel</SelectItem>
                      <SelectItem value="utilities">Contas</SelectItem>
                      <SelectItem value="supplies">Materiais</SelectItem>
                      <SelectItem value="equipment">Equipamento</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="taxes">Impostos</SelectItem>
                      <SelectItem value="insurance">Seguro</SelectItem>
                      <SelectItem value="maintenance">Manutencao</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descricao</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite a descricao da transacao"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amountInReais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="credit_card">
                        Cartao Credito
                      </SelectItem>
                      <SelectItem value="debit_card">
                        Cartao Debito
                      </SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="bank_transfer">
                        Transferencia
                      </SelectItem>
                      <SelectItem value="health_insurance">
                        Convenio
                      </SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Payment Machine & Installments */}
          {showMachineSelect && paymentMachines.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentMachineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maquininha</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione a maquininha" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMachines
                          .filter((m) => m.isActive)
                          .map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name} ({m.provider})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {showInstallments && (
                <FormField
                  control={form.control}
                  name="installments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcelas</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Parcelas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (n) => (
                              <SelectItem key={n} value={n.toString()}>
                                {n}x
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}

          {/* Fee calculation display */}
          {feeCalc && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3">
              <p className="text-sm font-medium text-amber-900">
                Taxa: {formatCurrency(feeCalc.feeAmountReais)} ({feeCalc.feePercent.toFixed(2)}%)
                {" · "}
                Liquido: {formatCurrency(feeCalc.netAmountReais)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="overdue">Vencido</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Vencimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Pagamento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente (opcional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
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
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observacoes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observacoes adicionais"
                    className="min-h-[80px]"
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
              disabled={upsertTransactionAction.isPending}
              className="w-full"
            >
              {upsertTransactionAction.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertTransactionForm;
