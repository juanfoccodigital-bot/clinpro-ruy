"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertTimeRecord } from "@/actions/upsert-time-record";
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
import { Textarea } from "@/components/ui/textarea";
import { timeTrackingTable } from "@/db/schema";

const formSchema = z.object({
  clockIn: z.string().min(1, {
    message: "Horario de entrada e obrigatorio.",
  }),
  clockOut: z.string().optional(),
  notes: z.string().optional(),
});

interface UpsertTimeRecordFormProps {
  isOpen: boolean;
  employeeId: string;
  timeRecord?: typeof timeTrackingTable.$inferSelect;
  onSuccess?: () => void;
}

const UpsertTimeRecordForm = ({
  isOpen,
  employeeId,
  timeRecord,
  onSuccess,
}: UpsertTimeRecordFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      clockIn: timeRecord?.clockIn
        ? new Date(timeRecord.clockIn).toISOString().slice(0, 16)
        : "",
      clockOut: timeRecord?.clockOut
        ? new Date(timeRecord.clockOut).toISOString().slice(0, 16)
        : "",
      notes: timeRecord?.notes ?? "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        clockIn: timeRecord?.clockIn
          ? new Date(timeRecord.clockIn).toISOString().slice(0, 16)
          : "",
        clockOut: timeRecord?.clockOut
          ? new Date(timeRecord.clockOut).toISOString().slice(0, 16)
          : "",
        notes: timeRecord?.notes ?? "",
      });
    }
  }, [isOpen, form, timeRecord]);

  const upsertTimeRecordAction = useAction(upsertTimeRecord, {
    onSuccess: () => {
      toast.success("Registro de ponto salvo com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar registro de ponto.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertTimeRecordAction.execute({
      id: timeRecord?.id,
      employeeId,
      clockIn: values.clockIn,
      clockOut: values.clockOut || undefined,
      notes: values.notes || undefined,
    });
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {timeRecord ? "Editar registro de ponto" : "Novo registro de ponto"}
        </DialogTitle>
        <DialogDescription>
          {timeRecord
            ? "Edite as informacoes do registro de ponto."
            : "Registre um novo ponto para o funcionario."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="clockIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entrada</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clockOut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saida</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
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

          <DialogFooter>
            <Button
              type="submit"
              disabled={upsertTimeRecordAction.isPending}
              className="w-full"
            >
              {upsertTimeRecordAction.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertTimeRecordForm;
