"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertEmployee } from "@/actions/upsert-employee";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { employeesTable } from "@/db/schema";

const formSchema = z.object({
  name: z.string().trim().min(1, {
    message: "Nome e obrigatorio.",
  }),
  email: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
  cpf: z.string().trim().optional(),
  role: z.enum(
    ["admin", "doctor", "receptionist", "nurse", "manager", "other"],
    {
      required_error: "Cargo e obrigatorio.",
    },
  ),
  specialty: z.string().trim().optional(),
  hireDate: z.string().optional(),
  salaryInReais: z.string().optional(),
  isActive: z.boolean(),
  notes: z.string().optional(),
});

interface UpsertEmployeeFormProps {
  isOpen: boolean;
  employee?: typeof employeesTable.$inferSelect;
  onSuccess?: () => void;
}

const UpsertEmployeeForm = ({
  employee,
  onSuccess,
  isOpen,
}: UpsertEmployeeFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: employee?.name ?? "",
      email: employee?.email ?? "",
      phoneNumber: employee?.phoneNumber ?? "",
      cpf: employee?.cpf ?? "",
      role: employee?.role ?? undefined,
      specialty: employee?.specialty ?? "",
      hireDate: employee?.hireDate
        ? new Date(employee.hireDate).toISOString().split("T")[0]
        : "",
      salaryInReais: employee?.salary
        ? (employee.salary / 100).toFixed(2)
        : "",
      isActive: employee?.isActive ?? true,
      notes: employee?.notes ?? "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: employee?.name ?? "",
        email: employee?.email ?? "",
        phoneNumber: employee?.phoneNumber ?? "",
        cpf: employee?.cpf ?? "",
        role: employee?.role ?? undefined,
        specialty: employee?.specialty ?? "",
        hireDate: employee?.hireDate
          ? new Date(employee.hireDate).toISOString().split("T")[0]
          : "",
        salaryInReais: employee?.salary
          ? (employee.salary / 100).toFixed(2)
          : "",
        isActive: employee?.isActive ?? true,
        notes: employee?.notes ?? "",
      });
    }
  }, [isOpen, form, employee]);

  const upsertEmployeeAction = useAction(upsertEmployee, {
    onSuccess: () => {
      toast.success("Funcionario salvo com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar funcionario.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const salary = values.salaryInReais
      ? Math.round(Number(values.salaryInReais.replace(",", ".")) * 100)
      : undefined;

    upsertEmployeeAction.execute({
      id: employee?.id,
      name: values.name,
      email: values.email || undefined,
      phoneNumber: values.phoneNumber || undefined,
      cpf: values.cpf || undefined,
      role: values.role,
      specialty: values.specialty || undefined,
      hireDate: values.hireDate || undefined,
      salary,
      isActive: values.isActive,
      notes: values.notes || undefined,
    });
  };

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {employee ? "Editar funcionario" : "Adicionar funcionario"}
        </DialogTitle>
        <DialogDescription>
          {employee
            ? "Edite as informacoes do funcionario."
            : "Adicione um novo funcionario a equipe da clinica."}
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
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input placeholder="000.000.000-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="receptionist">
                        Recepcionista
                      </SelectItem>
                      <SelectItem value="nurse">Enfermeiro(a)</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cardiologia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hireDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Admissao</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="salaryInReais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salario (R$)</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="0,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-end">
                  <FormLabel>Ativo</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
              disabled={upsertEmployeeAction.isPending}
              className="w-full"
            >
              {upsertEmployeeAction.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertEmployeeForm;
