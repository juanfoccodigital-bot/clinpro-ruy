"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertStockItem } from "@/actions/upsert-stock-item";
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
import { stockItemsTable } from "@/db/schema";

const formSchema = z.object({
  name: z.string().trim().min(1, {
    message: "Nome e obrigatorio.",
  }),
  category: z.enum(
    [
      "medication",
      "material",
      "equipment",
      "epi",
      "cleaning",
      "office",
      "other",
    ],
    {
      required_error: "Categoria e obrigatoria.",
    },
  ),
  sku: z.string().trim().optional(),
  currentQuantity: z.string().min(1, {
    message: "Quantidade e obrigatoria.",
  }),
  minimumQuantity: z.string().min(1, {
    message: "Quantidade minima e obrigatoria.",
  }),
  costInReais: z.string().optional(),
  expirationDate: z.string().optional(),
  location: z.string().trim().optional(),
  notes: z.string().optional(),
});

interface UpsertStockItemFormProps {
  isOpen: boolean;
  stockItem?: typeof stockItemsTable.$inferSelect;
  onSuccess?: () => void;
}

const UpsertStockItemForm = ({
  stockItem,
  onSuccess,
  isOpen,
}: UpsertStockItemFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: stockItem?.name ?? "",
      category: stockItem?.category ?? undefined,
      sku: stockItem?.sku ?? "",
      currentQuantity: stockItem?.currentQuantity?.toString() ?? "0",
      minimumQuantity: stockItem?.minimumQuantity?.toString() ?? "0",
      costInReais: stockItem?.costInCents
        ? (stockItem.costInCents / 100).toFixed(2)
        : "",
      expirationDate: stockItem?.expirationDate
        ? new Date(stockItem.expirationDate).toISOString().split("T")[0]
        : "",
      location: stockItem?.location ?? "",
      notes: stockItem?.notes ?? "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: stockItem?.name ?? "",
        category: stockItem?.category ?? undefined,
        sku: stockItem?.sku ?? "",
        currentQuantity: stockItem?.currentQuantity?.toString() ?? "0",
        minimumQuantity: stockItem?.minimumQuantity?.toString() ?? "0",
        costInReais: stockItem?.costInCents
          ? (stockItem.costInCents / 100).toFixed(2)
          : "",
        expirationDate: stockItem?.expirationDate
          ? new Date(stockItem.expirationDate).toISOString().split("T")[0]
          : "",
        location: stockItem?.location ?? "",
        notes: stockItem?.notes ?? "",
      });
    }
  }, [isOpen, form, stockItem]);

  const upsertStockItemAction = useAction(upsertStockItem, {
    onSuccess: () => {
      toast.success("Item de estoque salvo com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar item de estoque.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const costInCents = values.costInReais
      ? Math.round(Number(values.costInReais.replace(",", ".")) * 100)
      : undefined;

    upsertStockItemAction.execute({
      id: stockItem?.id,
      name: values.name,
      category: values.category,
      sku: values.sku || undefined,
      currentQuantity: Number(values.currentQuantity),
      minimumQuantity: Number(values.minimumQuantity),
      costInCents,
      expirationDate: values.expirationDate || undefined,
      location: values.location || undefined,
      notes: values.notes || undefined,
    });
  };

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {stockItem ? "Editar item de estoque" : "Adicionar item de estoque"}
        </DialogTitle>
        <DialogDescription>
          {stockItem
            ? "Edite as informacoes do item de estoque."
            : "Adicione um novo item ao estoque da clinica."}
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
                  <Input placeholder="Nome do item" {...field} />
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
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="medication">Medicamento</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="equipment">Equipamento</SelectItem>
                      <SelectItem value="epi">EPI</SelectItem>
                      <SelectItem value="cleaning">Limpeza</SelectItem>
                      <SelectItem value="office">Escritorio</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="Codigo SKU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="currentQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade Atual</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minimumQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade Minima</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="costInReais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custo (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="0,00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="expirationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Validade</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localizacao</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Armario A, Prateleira 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
              disabled={upsertStockItemAction.isPending}
              className="w-full"
            >
              {upsertStockItemAction.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertStockItemForm;
