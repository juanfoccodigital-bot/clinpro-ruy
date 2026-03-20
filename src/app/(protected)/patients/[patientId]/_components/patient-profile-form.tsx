"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertPatientProfile } from "@/actions/upsert-patient-profile";
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
import { Textarea } from "@/components/ui/textarea";
import { bloodTypes } from "@/constants/blood-types";
import { patientProfilesTable } from "@/db/schema";

const formSchema = z.object({
  cpf: z.string().optional(),
  rg: z.string().optional(),
  dateOfBirth: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  medications: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
});

interface PatientProfileFormProps {
  patientId: string;
  profile: typeof patientProfilesTable.$inferSelect | null;
}

const PatientProfileForm = ({
  patientId,
  profile,
}: PatientProfileFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cpf: profile?.cpf ?? "",
      rg: profile?.rg ?? "",
      dateOfBirth: profile?.dateOfBirth
        ? format(new Date(profile.dateOfBirth), "yyyy-MM-dd")
        : "",
      bloodType: profile?.bloodType ?? "",
      allergies: profile?.allergies ?? "",
      chronicConditions: profile?.chronicConditions ?? "",
      medications: profile?.medications ?? "",
      emergencyContactName: profile?.emergencyContactName ?? "",
      emergencyContactPhone: profile?.emergencyContactPhone ?? "",
      insuranceProvider: profile?.insuranceProvider ?? "",
      insuranceNumber: profile?.insuranceNumber ?? "",
      address: profile?.address ?? "",
      city: profile?.city ?? "",
      state: profile?.state ?? "",
      zipCode: profile?.zipCode ?? "",
      notes: profile?.notes ?? "",
    },
  });

  const upsertProfileAction = useAction(upsertPatientProfile, {
    onSuccess: () => {
      toast.success("Dados do paciente salvos com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao salvar dados do paciente.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertProfileAction.execute({
      patientId,
      cpf: values.cpf || undefined,
      rg: values.rg || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      bloodType: values.bloodType || undefined,
      allergies: values.allergies || undefined,
      chronicConditions: values.chronicConditions || undefined,
      medications: values.medications || undefined,
      emergencyContactName: values.emergencyContactName || undefined,
      emergencyContactPhone: values.emergencyContactPhone || undefined,
      insuranceProvider: values.insuranceProvider || undefined,
      insuranceNumber: values.insuranceNumber || undefined,
      address: values.address || undefined,
      city: values.city || undefined,
      state: values.state || undefined,
      zipCode: values.zipCode || undefined,
      notes: values.notes || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados Pessoais</CardTitle>
        <CardDescription>
          Informações complementares do paciente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Documentos */}
            <div>
              <h3 className="mb-4 text-sm font-medium">Documentos</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="###.###.###-##"
                          mask="_"
                          placeholder="000.000.000-00"
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value.value);
                          }}
                          customInput={Input}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o RG" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Informações Médicas */}
            <div>
              <h3 className="mb-4 text-sm font-medium">
                Informações Médicas
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="bloodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo Sanguíneo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o tipo sanguíneo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bloodTypes.map((bt) => (
                            <SelectItem key={bt.value} value={bt.value}>
                              {bt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alergias</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Liste as alergias conhecidas"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chronicConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condições Crônicas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Liste as condições crônicas"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicamentos em Uso</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Liste os medicamentos em uso"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Contato de Emergência */}
            <div>
              <h3 className="mb-4 text-sm font-medium">
                Contato de Emergência
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome do contato de emergência"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone do Contato</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="(##) #####-####"
                          mask="_"
                          placeholder="(11) 99999-9999"
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value.value);
                          }}
                          customInput={Input}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Convênio */}
            <div>
              <h3 className="mb-4 text-sm font-medium">Convênio</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="insuranceProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operadora</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome da operadora"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insuranceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da Carteirinha</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Número do convênio"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Endereço */}
            <div>
              <h3 className="mb-4 text-sm font-medium">Endereço</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Rua, número, complemento"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="UF" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="#####-###"
                          mask="_"
                          placeholder="00000-000"
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value.value);
                          }}
                          customInput={Input}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Observações */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações Gerais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais sobre o paciente"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={upsertProfileAction.isPending}
              >
                {upsertProfileAction.isPending
                  ? "Salvando..."
                  : "Salvar Dados"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PatientProfileForm;
