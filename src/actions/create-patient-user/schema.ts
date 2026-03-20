import { z } from "zod";

export const createPatientUserSchema = z.object({
  patientId: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(6, "A senha deve ter no minimo 6 caracteres"),
});

export type CreatePatientUserSchema = z.infer<typeof createPatientUserSchema>;
