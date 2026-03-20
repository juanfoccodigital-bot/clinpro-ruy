import { z } from "zod";

export const upsertDataRetentionPolicySchema = z.object({
  id: z.string().uuid().optional(),
  dataType: z.string().trim().min(1, {
    message: "Tipo de dado é obrigatório.",
  }),
  retentionDays: z
    .number()
    .int()
    .min(1, { message: "Dias de retenção deve ser no mínimo 1." }),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export type UpsertDataRetentionPolicySchema = z.input<
  typeof upsertDataRetentionPolicySchema
>;
