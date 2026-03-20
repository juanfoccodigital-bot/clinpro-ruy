import { z } from "zod";

export const upsertPatientProfileSchema = z.object({
  patientId: z.string().uuid({
    message: "Paciente é obrigatório.",
  }),
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

export type UpsertPatientProfileSchema = z.infer<
  typeof upsertPatientProfileSchema
>;
