import { z } from "zod";

export const upsertWaitingListItemSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid({
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().uuid().optional(),
  preferredDate: z.string().optional(),
  notes: z.string().optional(),
  status: z
    .enum(["waiting", "contacted", "scheduled", "cancelled"])
    .optional(),
});

export type UpsertWaitingListItemSchema = z.infer<
  typeof upsertWaitingListItemSchema
>;
