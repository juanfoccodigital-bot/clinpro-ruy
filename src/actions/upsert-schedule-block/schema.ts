import { z } from "zod";

export const upsertScheduleBlockSchema = z.object({
  id: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  title: z.string().trim().min(1, {
    message: "Título é obrigatório.",
  }),
  startDate: z.string().min(1, {
    message: "Data de início é obrigatória.",
  }),
  endDate: z.string().min(1, {
    message: "Data de término é obrigatória.",
  }),
  reason: z.string().optional(),
});

export type UpsertScheduleBlockSchema = z.infer<
  typeof upsertScheduleBlockSchema
>;
