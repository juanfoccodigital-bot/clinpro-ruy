"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { upsertQuickReply } from "@/actions/upsert-quick-reply";
import {
  UpsertQuickReplySchema,
  upsertQuickReplySchema,
} from "@/actions/upsert-quick-reply/schema";
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
import { Textarea } from "@/components/ui/textarea";

const AddQuickReplyButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<UpsertQuickReplySchema>({
    shouldUnregister: true,
    resolver: zodResolver(upsertQuickReplySchema),
    defaultValues: {
      shortcut: "",
      content: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        shortcut: "",
        content: "",
      });
    }
  }, [isOpen, form]);

  const upsertAction = useAction(upsertQuickReply, {
    onSuccess: () => {
      toast.success("Resposta rapida salva com sucesso.");
      setIsOpen(false);
    },
    onError: () => {
      toast.error("Erro ao salvar resposta rapida.");
    },
  });

  const onSubmit = (values: UpsertQuickReplySchema) => {
    upsertAction.execute(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Adicionar Resposta Rapida
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Resposta Rapida</DialogTitle>
          <DialogDescription>
            Crie um atalho para enviar mensagens frequentes rapidamente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="shortcut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atalho</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: saudacao, confirmar, cancelar" {...field} />
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
                  <FormLabel>Conteudo da Mensagem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite o conteudo da resposta rapida..."
                      className="min-h-[100px]"
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
    </Dialog>
  );
};

export default AddQuickReplyButton;
