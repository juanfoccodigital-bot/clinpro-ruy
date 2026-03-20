import { z } from "zod";

export const upsertDocumentTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(
    ["prescription", "certificate", "report", "exam_request", "referral"],
    {
      required_error: "Tipo de template é obrigatório.",
    },
  ),
  name: z.string().trim().min(1, {
    message: "Nome é obrigatório.",
  }),
  content: z.string().trim().min(1, {
    message: "Conteúdo é obrigatório.",
  }),
  isDefault: z.boolean().optional(),
});

export type UpsertDocumentTemplateSchema = z.infer<
  typeof upsertDocumentTemplateSchema
>;
