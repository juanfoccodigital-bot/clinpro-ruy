"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertDoctorCommission } from "@/actions/upsert-doctor-commission";
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
import { doctorCommissionsTable, doctorsTable } from "@/db/schema";

const formSchema = z.object({
  doctorId: z.string().uuid({
    message: "Profissional e obrigatorio.",
  }),
  commissionPercentage: z
    .string()
    .min(1, { message: "Percentual e obrigatorio." })
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      {
        message: "Percentual deve ser entre 0 e 100.",
      },
    ),
});

interface CommissionFormProps {
  isOpen: boolean;
  commission?: typeof doctorCommissionsTable.$inferSelect;
  doctors: (typeof doctorsTable.$inferSelect)[];
  onSuccess?: () => void;
}

const CommissionForm = ({
  commission,
  doctors,
  onSuccess,
  isOpen,
}: CommissionFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorId: commission?.doctorId ?? undefined,
      commissionPercentage: commission
        ? String(commission.commissionPercentage)
        : "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        doctorId: commission?.doctorId ?? undefined,
        commissionPercentage: commission
          ? String(commission.commissionPercentage)
          : "",
      });
    }
  }, [isOpen, form, commission]);

  const upsertCommissionAction = useAction(upsertDoctorCommission, {
    onSuccess: () => {
      toast.success("Comissao salva com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar comissao.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertCommissionAction.execute({
      id: commission?.id,
      doctorId: values.doctorId,
      commissionPercentage: Number(values.commissionPercentage),
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {commission ? "Editar comissao" : "Definir comissao"}
        </DialogTitle>
        <DialogDescription>
          {commission
            ? "Edite o percentual de comissao do profissional."
            : "Defina o percentual de comissao para um profissional."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profissional</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o profissional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
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
            name="commissionPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Percentual de Comissao (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="Ex: 30"
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
              disabled={upsertCommissionAction.isPending}
              className="w-full"
            >
              {upsertCommissionAction.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default CommissionForm;
