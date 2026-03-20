import { z } from "zod";

export const upsertConsentTermSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid({
    message: "Paciente é obrigatório.",
  }),
  type: z.enum(
    [
      "treatment",
      "data_sharing",
      "marketing",
      "research",
      "terms_of_use",
      "privacy_policy",
    ],
    {
      required_error: "Tipo de consentimento é obrigatório.",
    },
  ),
  version: z.string().trim().min(1, {
    message: "Versão é obrigatória.",
  }),
  accepted: z.boolean({
    required_error: "Aceite é obrigatório.",
  }),
  ipAddress: z.string().optional(),
});

export type UpsertConsentTermSchema = z.infer<typeof upsertConsentTermSchema>;
