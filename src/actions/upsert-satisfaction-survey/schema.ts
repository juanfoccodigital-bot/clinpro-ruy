import { z } from "zod";

export const upsertSatisfactionSurveySchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid({
    message: "Paciente é obrigatório.",
  }),
  appointmentId: z.string().uuid().optional(),
  score: z
    .number()
    .int()
    .min(0, { message: "Nota mínima é 0." })
    .max(10, { message: "Nota máxima é 10." }),
  comment: z.string().optional(),
});

export type UpsertSatisfactionSurveySchema = z.infer<
  typeof upsertSatisfactionSurveySchema
>;
