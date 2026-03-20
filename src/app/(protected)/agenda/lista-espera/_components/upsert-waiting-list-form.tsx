"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertWaitingListItem } from "@/actions/upsert-waiting-list-item";
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
import { patientsTable, waitingListTable } from "@/db/schema";

const formSchema = z.object({
  patientId: z.string().uuid({
    message: "Paciente e obrigatorio.",
  }),
  preferredDate: z.string().optional(),
  notes: z.string().optional(),
  status: z
    .enum(["waiting", "contacted", "scheduled", "cancelled"])
    .optional(),
});

interface UpsertWaitingListFormProps {
  isOpen: boolean;
  patients: (typeof patientsTable.$inferSelect)[];
  item?: typeof waitingListTable.$inferSelect;
  onSuccess?: () => void;
}

const UpsertWaitingListForm = ({
  isOpen,
  patients,
  item,
  onSuccess,
}: UpsertWaitingListFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: item?.patientId ?? "",
      preferredDate: item?.preferredDate
        ? dayjs(item.preferredDate).format("YYYY-MM-DD")
        : "",
      notes: item?.notes ?? "",
      status: item?.status ?? "waiting",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        patientId: item?.patientId ?? "",
        preferredDate: item?.preferredDate
          ? dayjs(item.preferredDate).format("YYYY-MM-DD")
          : "",
        notes: item?.notes ?? "",
        status: item?.status ?? "waiting",
      });
    }
  }, [isOpen, form, item]);

  const upsertAction = useAction(upsertWaitingListItem, {
    onSuccess: () => {
      toast.success("Item da lista de espera salvo com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar item da lista de espera.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertAction.execute({
      ...values,
      id: item?.id,
      preferredDate: values.preferredDate || undefined,
      notes: values.notes || undefined,
    });
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {item
            ? "Editar item da lista de espera"
            : "Adicionar a lista de espera"}
        </DialogTitle>
        <DialogDescription>
          {item
            ? "Edite as informacoes do item da lista de espera."
            : "Adicione um paciente a lista de espera."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um paciente" />
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
            name="preferredDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data preferida</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
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
                    <SelectItem value="waiting">Aguardando</SelectItem>
                    <SelectItem value="contacted">Contatado</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
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
  );
};

export default UpsertWaitingListForm;
