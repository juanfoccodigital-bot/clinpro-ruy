"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertVitals } from "@/actions/upsert-vitals";
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
import { vitalsTable } from "@/db/schema";

const formSchema = z.object({
  systolicBP: z.string().optional(),
  diastolicBP: z.string().optional(),
  heartRate: z.string().optional(),
  temperature: z.string().optional(),
  weight: z.string().optional(),
  heightInCm: z.string().optional(),
  oxygenSaturation: z.string().optional(),
  respiratoryRate: z.string().optional(),
  notes: z.string().optional(),
});

interface UpsertVitalsFormProps {
  patientId: string;
  vital?: typeof vitalsTable.$inferSelect;
  isOpen: boolean;
  onSuccess?: () => void;
}

const UpsertVitalsForm = ({
  patientId,
  vital,
  isOpen,
  onSuccess,
}: UpsertVitalsFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      systolicBP: vital?.systolicBP?.toString() ?? "",
      diastolicBP: vital?.diastolicBP?.toString() ?? "",
      heartRate: vital?.heartRate?.toString() ?? "",
      temperature: vital?.temperature
        ? (vital.temperature / 10).toFixed(1)
        : "",
      weight: vital?.weightInGrams
        ? (vital.weightInGrams / 1000).toFixed(1)
        : "",
      heightInCm: vital?.heightInCm?.toString() ?? "",
      oxygenSaturation: vital?.oxygenSaturation?.toString() ?? "",
      respiratoryRate: vital?.respiratoryRate?.toString() ?? "",
      notes: vital?.notes ?? "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        systolicBP: vital?.systolicBP?.toString() ?? "",
        diastolicBP: vital?.diastolicBP?.toString() ?? "",
        heartRate: vital?.heartRate?.toString() ?? "",
        temperature: vital?.temperature
          ? (vital.temperature / 10).toFixed(1)
          : "",
        weight: vital?.weightInGrams
          ? (vital.weightInGrams / 1000).toFixed(1)
          : "",
        heightInCm: vital?.heightInCm?.toString() ?? "",
        oxygenSaturation: vital?.oxygenSaturation?.toString() ?? "",
        respiratoryRate: vital?.respiratoryRate?.toString() ?? "",
        notes: vital?.notes ?? "",
      });
    }
  }, [isOpen, form, vital]);

  const upsertVitalsAction = useAction(upsertVitals, {
    onSuccess: () => {
      toast.success("Sinais vitais salvos com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar sinais vitais.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const parseOptionalInt = (value: string | undefined) => {
      if (!value || value.trim() === "") return undefined;
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    };

    const parseOptionalFloat = (value: string | undefined) => {
      if (!value || value.trim() === "") return undefined;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    };

    upsertVitalsAction.execute({
      id: vital?.id,
      patientId,
      systolicBP: parseOptionalInt(values.systolicBP),
      diastolicBP: parseOptionalInt(values.diastolicBP),
      heartRate: parseOptionalInt(values.heartRate),
      temperature: parseOptionalFloat(values.temperature)
        ? Math.round(parseOptionalFloat(values.temperature)! * 10)
        : undefined,
      weightInGrams: parseOptionalFloat(values.weight)
        ? Math.round(parseOptionalFloat(values.weight)! * 1000)
        : undefined,
      heightInCm: parseOptionalInt(values.heightInCm),
      oxygenSaturation: parseOptionalInt(values.oxygenSaturation),
      respiratoryRate: parseOptionalInt(values.respiratoryRate),
      notes: values.notes || undefined,
    });
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {vital ? "Editar Sinais Vitais" : "Registrar Sinais Vitais"}
        </DialogTitle>
        <DialogDescription>
          {vital
            ? "Edite os sinais vitais do paciente."
            : "Registre os sinais vitais do paciente."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="systolicBP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PA Sistólica (mmHg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="120"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="diastolicBP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PA Diastólica (mmHg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="80"
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
              name="heartRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequência Cardíaca (bpm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="72"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperatura (°C)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="36.5"
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
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="70.0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="heightInCm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Altura (cm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="170"
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
              name="oxygenSaturation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saturação O2 (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="98"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="respiratoryRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Freq. Respiratória (rpm)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="16"
                      {...field}
                    />
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
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observações adicionais..."
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
              disabled={upsertVitalsAction.isPending}
              className="w-full"
            >
              {upsertVitalsAction.isPending
                ? "Salvando..."
                : "Salvar Sinais Vitais"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertVitalsForm;
