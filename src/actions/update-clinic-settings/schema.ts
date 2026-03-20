import { z } from "zod";

export const updateClinicSettingsSchema = z.object({
  name: z.string().min(1, "Nome da clinica e obrigatorio"),
  logoUrl: z.string().nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor invalida").optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor invalida").optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor invalida").optional(),
});

export type UpdateClinicSettingsInput = z.infer<typeof updateClinicSettingsSchema>;
