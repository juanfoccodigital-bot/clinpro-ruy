"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertScheduleBlock } from "@/actions/upsert-schedule-block";
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
import { doctorScheduleBlocksTable } from "@/db/schema";

const formSchema = z.object({
  title: z.string().trim().min(1, {
    message: "Titulo e obrigatorio.",
  }),
  startDate: z.string().min(1, {
    message: "Data de inicio e obrigatoria.",
  }),
  endDate: z.string().min(1, {
    message: "Data de termino e obrigatoria.",
  }),
  reason: z.string().optional(),
});

interface UpsertBlockFormProps {
  isOpen: boolean;
  block?: typeof doctorScheduleBlocksTable.$inferSelect;
  onSuccess?: () => void;
}

const UpsertBlockForm = ({
  isOpen,
  block,
  onSuccess,
}: UpsertBlockFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: block?.title ?? "",
      startDate: block?.startDate
        ? dayjs(block.startDate).format("YYYY-MM-DDTHH:mm")
        : "",
      endDate: block?.endDate
        ? dayjs(block.endDate).format("YYYY-MM-DDTHH:mm")
        : "",
      reason: block?.reason ?? "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: block?.title ?? "",
        startDate: block?.startDate
          ? dayjs(block.startDate).format("YYYY-MM-DDTHH:mm")
          : "",
        endDate: block?.endDate
          ? dayjs(block.endDate).format("YYYY-MM-DDTHH:mm")
          : "",
        reason: block?.reason ?? "",
      });
    }
  }, [isOpen, form, block]);

  const upsertAction = useAction(upsertScheduleBlock, {
    onSuccess: () => {
      toast.success("Bloqueio salvo com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar bloqueio.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertAction.execute({
      ...values,
      id: block?.id,
      reason: values.reason || undefined,
    });
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {block ? "Editar bloqueio" : "Adicionar bloqueio"}
        </DialogTitle>
        <DialogDescription>
          {block
            ? "Edite as informacoes do bloqueio de horario."
            : "Bloqueie um horario na agenda."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titulo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Ferias, Congresso, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de inicio</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de termino</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Motivo do bloqueio"
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

export default UpsertBlockForm;
