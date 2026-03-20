"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertCampaign } from "@/actions/upsert-campaign";
import { upsertCampaignSchema } from "@/actions/upsert-campaign/schema";
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
import { campaignsTable } from "@/db/schema";

const typeLabels: Record<string, string> = {
  birthday: "Aniversario",
  inactive: "Pacientes Inativos",
  follow_up: "Acompanhamento",
  promotional: "Promocional",
  custom: "Personalizada",
};

const channelLabels: Record<string, string> = {
  email: "E-mail",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

type FormValues = z.infer<typeof upsertCampaignSchema>;

interface UpsertCampaignFormProps {
  isOpen: boolean;
  campaign?: typeof campaignsTable.$inferSelect;
  onSuccess?: () => void;
}

const UpsertCampaignForm = ({
  campaign,
  onSuccess,
  isOpen,
}: UpsertCampaignFormProps) => {
  const form = useForm<FormValues>({
    shouldUnregister: true,
    resolver: zodResolver(upsertCampaignSchema),
    defaultValues: {
      name: campaign?.name ?? "",
      type: campaign?.type ?? undefined,
      channel: campaign?.channel ?? undefined,
      subject: campaign?.subject ?? "",
      template: campaign?.template ?? "",
      scheduledFor: campaign?.scheduledFor
        ? new Date(campaign.scheduledFor).toISOString().slice(0, 16)
        : "",
      notes: campaign?.notes ?? "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: campaign?.name ?? "",
        type: campaign?.type ?? undefined,
        channel: campaign?.channel ?? undefined,
        subject: campaign?.subject ?? "",
        template: campaign?.template ?? "",
        scheduledFor: campaign?.scheduledFor
          ? new Date(campaign.scheduledFor).toISOString().slice(0, 16)
          : "",
        notes: campaign?.notes ?? "",
      });
    }
  }, [isOpen, form, campaign]);

  const upsertCampaignAction = useAction(upsertCampaign, {
    onSuccess: () => {
      toast.success("Campanha salva com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar campanha.");
    },
  });

  const onSubmit = (values: FormValues) => {
    upsertCampaignAction.execute({
      id: campaign?.id,
      name: values.name,
      type: values.type,
      channel: values.channel,
      subject: values.subject || undefined,
      template: values.template,
      scheduledFor: values.scheduledFor || undefined,
      notes: values.notes || undefined,
    });
  };

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {campaign ? "Editar campanha" : "Nova campanha"}
        </DialogTitle>
        <DialogDescription>
          {campaign
            ? "Edite as informacoes da campanha."
            : "Crie uma nova campanha de marketing."}
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
                  <Input placeholder="Nome da campanha" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canal</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o canal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(channelLabels).map(([value, label]) => (
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
          </div>

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assunto</FormLabel>
                <FormControl>
                  <Input placeholder="Assunto da mensagem" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="template"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Conteudo da mensagem"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduledFor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agendar para</FormLabel>
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
              disabled={upsertCampaignAction.isPending}
              className="w-full"
            >
              {upsertCampaignAction.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertCampaignForm;
