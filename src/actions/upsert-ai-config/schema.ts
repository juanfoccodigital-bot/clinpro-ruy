import { z } from "zod";

export const upsertAiConfigSchema = z.object({
  isActive: z.boolean(),
  provider: z.string(),
  model: z.string(),
  systemPrompt: z.string().optional(),
  enableScheduling: z.boolean(),
  enablePatientLookup: z.boolean(),
  enableAvailabilityCheck: z.boolean(),
  enableGreeting: z.boolean(),
  maxTokensPerMessage: z
    .number()
    .min(100, {
      message: "O numero minimo de tokens por mensagem e 100.",
    })
    .max(4000, {
      message: "O numero maximo de tokens por mensagem e 4000.",
    }),
});

export type UpsertAiConfigSchema = z.input<typeof upsertAiConfigSchema>;
