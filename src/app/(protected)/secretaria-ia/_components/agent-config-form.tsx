"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertAiConfig } from "@/actions/upsert-ai-config";
import { upsertAiConfigSchema } from "@/actions/upsert-ai-config/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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

type FormValues = z.infer<typeof upsertAiConfigSchema>;

interface AgentConfigFormProps {
  config?: {
    isActive: boolean;
    provider: string;
    model: string;
    systemPrompt: string | null;
    enableScheduling: boolean;
    enablePatientLookup: boolean;
    enableAvailabilityCheck: boolean;
    enableGreeting: boolean;
    maxTokensPerMessage: number;
  };
}

const AgentConfigForm = ({ config }: AgentConfigFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(upsertAiConfigSchema),
    defaultValues: {
      isActive: config?.isActive ?? false,
      provider: config?.provider ?? "openai",
      model: config?.model ?? "gpt-4o-mini",
      systemPrompt: config?.systemPrompt ?? "",
      enableScheduling: config?.enableScheduling ?? true,
      enablePatientLookup: config?.enablePatientLookup ?? true,
      enableAvailabilityCheck: config?.enableAvailabilityCheck ?? true,
      enableGreeting: config?.enableGreeting ?? true,
      maxTokensPerMessage: config?.maxTokensPerMessage ?? 500,
    },
  });

  const upsertAction = useAction(upsertAiConfig, {
    onSuccess: () => {
      toast.success("Configuracao salva com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao salvar configuracao.");
    },
  });

  const onSubmit = (values: FormValues) => {
    upsertAction.execute(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuracao do Agente</CardTitle>
        <CardDescription>
          Defina o provedor de IA, modelo, prompt do sistema e habilidades do
          agente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Provider and Model */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provedor de IA</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o provedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: gpt-4o-mini" {...field} />
                    </FormControl>
                    <FormDescription>
                      Identificador do modelo a ser utilizado.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* System Prompt */}
            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt do Sistema</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instrucoes para o agente de IA. Ex: Voce e uma secretaria virtual de uma clinica medica..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Instrucoes que definem o comportamento e personalidade do
                    agente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Tokens */}
            <FormField
              control={form.control}
              name="maxTokensPerMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tokens por Mensagem</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={100}
                      max={4000}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Limite de tokens por resposta do agente (100 a 4000).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Capabilities */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Habilidades do Agente</h3>
              <p className="text-sm text-muted-foreground">
                Selecione quais funcionalidades o agente pode executar durante as
                conversas.
              </p>

              <FormField
                control={form.control}
                name="enableGreeting"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Saudacao</FormLabel>
                      <FormDescription>
                        Enviar mensagem de boas-vindas ao iniciar conversa.
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="enableScheduling"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Agendamento</FormLabel>
                      <FormDescription>
                        Permitir que o agente agende procedimentos para pacientes.
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="enablePatientLookup"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Consulta de Pacientes
                      </FormLabel>
                      <FormDescription>
                        Permitir que o agente busque dados cadastrais de
                        pacientes.
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="enableAvailabilityCheck"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Verificacao de Disponibilidade
                      </FormLabel>
                      <FormDescription>
                        Permitir que o agente consulte horarios disponiveis da
                        clinica.
                      </FormDescription>
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
            </div>

            <Button
              type="submit"
              disabled={upsertAction.isPending}
              className="w-full"
            >
              {upsertAction.isPending ? "Salvando..." : "Salvar Configuracao"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AgentConfigForm;
