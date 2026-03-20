"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertDocument } from "@/actions/upsert-document";
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
import { documentsTable, patientsTable } from "@/db/schema";

const formSchema = z.object({
  type: z.enum(
    ["prescription", "certificate", "report", "exam_request", "referral"],
    {
      required_error: "Tipo é obrigatório.",
    },
  ),
  patientId: z.string().uuid({
    message: "Paciente é obrigatório.",
  }),
  title: z.string().trim().min(1, {
    message: "Título é obrigatório.",
  }),
  content: z.string().trim().min(1, {
    message: "Conteúdo é obrigatório.",
  }),
});

interface UpsertDocumentFormProps {
  isOpen: boolean;
  document?: typeof documentsTable.$inferSelect;
  patients: (typeof patientsTable.$inferSelect)[];
  onSuccess?: () => void;
}

const UpsertDocumentForm = ({
  document,
  patients,
  onSuccess,
  isOpen,
}: UpsertDocumentFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: document?.type ?? undefined,
      patientId: document?.patientId ?? undefined,
      title: document?.title ?? "",
      content: document?.content ?? "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        type: document?.type ?? undefined,
        patientId: document?.patientId ?? undefined,
        title: document?.title ?? "",
        content: document?.content ?? "",
      });
    }
  }, [isOpen, form, document]);

  const upsertDocumentAction = useAction(upsertDocument, {
    onSuccess: () => {
      toast.success("Documento salvo com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar documento.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertDocumentAction.execute({
      ...values,
      id: document?.id,
    });
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {document ? "Editar documento" : "Adicionar documento"}
        </DialogTitle>
        <DialogDescription>
          {document
            ? "Edite as informações desse documento."
            : "Adicione um novo documento."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <SelectItem value="prescription">Receita</SelectItem>
                    <SelectItem value="certificate">Atestado</SelectItem>
                    <SelectItem value="report">Laudo</SelectItem>
                    <SelectItem value="exam_request">
                      Solicitação de Exame
                    </SelectItem>
                    <SelectItem value="referral">Encaminhamento</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o título do documento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conteúdo</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Digite o conteúdo do documento"
                    className="min-h-[200px]"
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
              disabled={upsertDocumentAction.isPending}
              className="w-full"
            >
              {upsertDocumentAction.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertDocumentForm;
