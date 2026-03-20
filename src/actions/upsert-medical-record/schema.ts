import { z } from "zod";

export const upsertMedicalRecordSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid({
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  type: z.enum(
    [
      "anamnesis",
      "evolution",
      "exam_result",
      "prescription",
      "certificate",
      "referral",
    ],
    {
      required_error: "Tipo de registro é obrigatório.",
    },
  ),
  title: z.string().trim().min(1, {
    message: "Título é obrigatório.",
  }),
  content: z.string().trim().min(1, {
    message: "Conteúdo é obrigatório.",
  }),
  cid10Code: z.string().optional(),
  cid10Description: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

export type UpsertMedicalRecordSchema = z.infer<
  typeof upsertMedicalRecordSchema
>;
