"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { createProcedure, updateProcedure } from "@/actions/procedures";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { stockItemsTable } from "@/db/schema";

const CATEGORIES = [
  { value: "toxina_botulinica", label: "Toxina Botulínica" },
  { value: "preenchimento", label: "Preenchimento" },
  { value: "bioestimulador", label: "Bioestimulador" },
  { value: "skinbooster", label: "Skinbooster" },
  { value: "peeling", label: "Peeling" },
  { value: "laser", label: "Laser" },
  { value: "protocolo", label: "Protocolo" },
  { value: "avaliacao", label: "Avaliação" },
  { value: "retorno", label: "Retorno" },
  { value: "outro", label: "Outro" },
];

const DURATIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
  { value: 90, label: "90 min" },
  { value: 120, label: "120 min" },
];

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  defaultPrice: z.number().min(0, "Preço inválido"),
  durationMinutes: z.number().min(15),
  isActive: z.boolean(),
  stockItems: z.array(
    z.object({
      stockItemId: z.string().min(1, "Selecione um material"),
      quantityUsed: z.number().min(0.01, "Quantidade inválida"),
    }),
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface ProcedureData {
  id: string;
  name: string;
  description: string | null;
  category: string;
  defaultPriceInCents: number;
  durationMinutes: number;
  isActive: boolean;
  stockItems: {
    stockItemId: string;
    quantityUsed: string;
  }[];
}

interface UpsertProcedureFormProps {
  procedure?: ProcedureData;
  stockItems: (typeof stockItemsTable.$inferSelect)[];
  onSuccess?: () => void;
  isOpen: boolean;
}

const UpsertProcedureForm = ({
  procedure,
  stockItems,
  onSuccess,
  isOpen,
}: UpsertProcedureFormProps) => {
  const isEditing = !!procedure;

  const form = useForm<FormValues>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: procedure?.name ?? "",
      description: procedure?.description ?? "",
      category: procedure?.category ?? "",
      defaultPrice: procedure ? procedure.defaultPriceInCents / 100 : 0,
      durationMinutes: procedure?.durationMinutes ?? 60,
      isActive: procedure?.isActive ?? true,
      stockItems:
        procedure?.stockItems?.map((si) => ({
          stockItemId: si.stockItemId,
          quantityUsed: Number(si.quantityUsed),
        })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stockItems",
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: procedure?.name ?? "",
        description: procedure?.description ?? "",
        category: procedure?.category ?? "",
        defaultPrice: procedure ? procedure.defaultPriceInCents / 100 : 0,
        durationMinutes: procedure?.durationMinutes ?? 60,
        isActive: procedure?.isActive ?? true,
        stockItems:
          procedure?.stockItems?.map((si) => ({
            stockItemId: si.stockItemId,
            quantityUsed: Number(si.quantityUsed),
          })) ?? [],
      });
    }
  }, [isOpen, form, procedure]);

  const createAction = useAction(createProcedure, {
    onSuccess: () => {
      toast.success("Procedimento criado com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao criar procedimento.");
    },
  });

  const updateAction = useAction(updateProcedure, {
    onSuccess: () => {
      toast.success("Procedimento atualizado com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao atualizar procedimento.");
    },
  });

  const isPending = createAction.isPending || updateAction.isPending;

  const onSubmit = (values: FormValues) => {
    const data = {
      name: values.name,
      description: values.description || undefined,
      category: values.category,
      defaultPriceInCents: Math.round(values.defaultPrice * 100),
      durationMinutes: values.durationMinutes,
      isActive: values.isActive,
      stockItems: values.stockItems.length > 0 ? values.stockItems : undefined,
    };

    if (isEditing && procedure) {
      updateAction.execute({ ...data, id: procedure.id });
    } else {
      createAction.execute(data);
    }
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar procedimento" : "Novo procedimento"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Atualize as informações do procedimento."
            : "Cadastre um novo procedimento para sua clínica."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Toxina Botulínica - Frontal" {...field} />
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
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descrição do procedimento..."
                    className="min-h-[80px] resize-none"
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
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
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DURATIONS.map((dur) => (
                        <SelectItem key={dur.value} value={String(dur.value)}>
                          {dur.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="defaultPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço padrão</FormLabel>
                <NumericFormat
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value.floatValue ?? 0);
                  }}
                  decimalScale={2}
                  fixedDecimalScale
                  decimalSeparator=","
                  thousandSeparator="."
                  prefix="R$ "
                  allowNegative={false}
                  customInput={Input}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium">Ativo</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Procedimentos inativos não aparecem nos agendamentos
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Separator />

          {/* Stock Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Materiais utilizados</h4>
                <p className="text-xs text-muted-foreground">
                  Itens de estoque consumidos neste procedimento
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ stockItemId: "", quantityUsed: 1 })
                }
              >
                <Plus className="mr-1 h-4 w-4" />
                Adicionar material
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-end gap-2 rounded-lg border bg-muted/30 p-3"
              >
                <FormField
                  control={form.control}
                  name={`stockItems.${index}.stockItemId`}
                  render={({ field: selectField }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs">Material</FormLabel>
                      <Select
                        onValueChange={selectField.onChange}
                        value={selectField.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o material" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stockItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
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
                  name={`stockItems.${index}.quantityUsed`}
                  render={({ field: qtyField }) => (
                    <FormItem className="w-28">
                      <FormLabel className="text-xs">Qtd</FormLabel>
                      <FormControl>
                        <NumericFormat
                          value={qtyField.value}
                          onValueChange={(v) =>
                            qtyField.onChange(v.floatValue ?? 0)
                          }
                          decimalScale={2}
                          decimalSeparator=","
                          allowNegative={false}
                          customInput={Input}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mb-0.5 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {fields.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-4">
                Nenhum material vinculado a este procedimento.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditing
                  ? "Salvando..."
                  : "Criando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Criar procedimento"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertProcedureForm;
