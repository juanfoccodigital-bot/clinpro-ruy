import { z } from "zod";

export const upsertTimeRecordSchema = z.object({
  id: z.string().uuid().optional(),
  employeeId: z.string().uuid({
    message: "Funcionário é obrigatório.",
  }),
  clockIn: z.string().min(1, {
    message: "Horário de entrada é obrigatório.",
  }),
  clockOut: z.string().optional(),
  notes: z.string().optional(),
});

export type UpsertTimeRecordSchema = z.infer<typeof upsertTimeRecordSchema>;
