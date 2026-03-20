"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertMedicalRecord } from "@/actions/upsert-medical-record";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cid10Codes } from "@/constants/cid10";
import { medicalRecordsTable } from "@/db/schema";
import { cn } from "@/lib/utils";

const recordTypes = [
  { value: "anamnesis", label: "Anamnese" },
  { value: "evolution", label: "Evolução" },
  { value: "exam_result", label: "Resultado de Exame" },
  { value: "prescription", label: "Receita" },
  { value: "certificate", label: "Atestado" },
  { value: "referral", label: "Encaminhamento" },
] as const;

const formSchema = z.object({
  type: z.enum(
    [
      "anamnesis",
      "evolution",
      "exam_result",
      "prescription",
      "certificate",
      "referral",
    ],
    {
      required_error: "Tipo é obrigatório.",
    },
  ),
  title: z.string().trim().min(1, {
    message: "Título é obrigatório.",
  }),
  content: z.string().trim().min(1, {
    message: "Conteúdo é obrigatório.",
  }),
  cid10Code: z.string().optional(),
  cid10Description: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

interface UpsertMedicalRecordFormProps {
  patientId: string;
  record?: typeof medicalRecordsTable.$inferSelect;
  isOpen: boolean;
  onSuccess?: () => void;
}

const UpsertMedicalRecordForm = ({
  patientId,
  record,
  isOpen,
  onSuccess,
}: UpsertMedicalRecordFormProps) => {
  const [cidPopoverOpen, setCidPopoverOpen] = useState(false);
  const [cidSearch, setCidSearch] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: record?.type ?? undefined,
      title: record?.title ?? "",
      content: record?.content ?? "",
      cid10Code: record?.cid10Code ?? "",
      cid10Description: record?.cid10Description ?? "",
      isPrivate: record?.isPrivate ?? false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        type: record?.type ?? undefined,
        title: record?.title ?? "",
        content: record?.content ?? "",
        cid10Code: record?.cid10Code ?? "",
        cid10Description: record?.cid10Description ?? "",
        isPrivate: record?.isPrivate ?? false,
      });
      setCidSearch("");
    }
  }, [isOpen, form, record]);

  const upsertRecordAction = useAction(upsertMedicalRecord, {
    onSuccess: () => {
      toast.success("Registro salvo com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar registro.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertRecordAction.execute({
      ...values,
      id: record?.id,
      patientId,
    });
  };

  const filteredCid10 = useMemo(() => {
    if (!cidSearch) return cid10Codes.slice(0, 50);
    const search = cidSearch.toLowerCase();
    return cid10Codes
      .filter(
        (c) =>
          c.code.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search),
      )
      .slice(0, 50);
  }, [cidSearch]);

  const selectedCid = form.watch("cid10Code");

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>
          {record ? "Editar Registro" : "Novo Registro Clínico"}
        </DialogTitle>
        <DialogDescription>
          {record
            ? "Edite as informações do registro clínico."
            : "Preencha os dados do novo registro clínico."}
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
                      {recordTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título do registro" {...field} />
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
                    placeholder="Descreva os detalhes do registro clínico..."
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cid10Code"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>CID-10 (opcional)</FormLabel>
                <Popover
                  open={cidPopoverOpen}
                  onOpenChange={setCidPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? `${field.value} - ${form.getValues("cid10Description") || ""}`
                          : "Buscar CID-10..."}
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Buscar por código ou descrição..."
                        value={cidSearch}
                        onValueChange={setCidSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          Nenhum código encontrado.
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredCid10.map((cid) => (
                            <CommandItem
                              key={cid.code}
                              value={cid.code}
                              onSelect={() => {
                                form.setValue("cid10Code", cid.code);
                                form.setValue(
                                  "cid10Description",
                                  cid.description,
                                );
                                setCidPopoverOpen(false);
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCid === cid.code
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <span className="font-mono text-xs">
                                {cid.code}
                              </span>
                              <span className="ml-2 text-sm">
                                {cid.description}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPrivate"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Nota privada</FormLabel>
                  <p className="text-muted-foreground text-xs">
                    Marque para restringir a visualização deste registro
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

          <DialogFooter>
            <Button
              type="submit"
              disabled={upsertRecordAction.isPending}
              className="w-full"
            >
              {upsertRecordAction.isPending ? "Salvando..." : "Salvar Registro"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertMedicalRecordForm;
