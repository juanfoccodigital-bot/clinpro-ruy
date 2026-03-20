import { z } from "zod";

export const upsertVitalsSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid({
    message: "Paciente é obrigatório.",
  }),
  appointmentId: z.string().uuid().optional(),
  systolicBP: z.number().optional(),
  diastolicBP: z.number().optional(),
  heartRate: z.number().optional(),
  temperature: z.number().optional(),
  weightInGrams: z.number().optional(),
  heightInCm: z.number().optional(),
  oxygenSaturation: z.number().optional(),
  respiratoryRate: z.number().optional(),
  notes: z.string().optional(),
});

export type UpsertVitalsSchema = z.infer<typeof upsertVitalsSchema>;
