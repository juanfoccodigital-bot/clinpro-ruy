import { z } from "zod";

export const upsertDocumentSchema = z.object({
  id: z.string().uuid().optional(),
  patientId: z.string().uuid({
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().uuid().optional(),
  type: z.enum(
    ["prescription", "certificate", "report", "exam_request", "referral"],
    {
      required_error: "Tipo de documento é obrigatório.",
    },
  ),
  title: z.string().trim().min(1, {
    message: "Título é obrigatório.",
  }),
  content: z.string().trim().min(1, {
    message: "Conteúdo é obrigatório.",
  }),
  appointmentId: z.string().uuid().optional(),
  metadata: z.unknown().optional(),
});

export type UpsertDocumentSchema = z.infer<typeof upsertDocumentSchema>;
