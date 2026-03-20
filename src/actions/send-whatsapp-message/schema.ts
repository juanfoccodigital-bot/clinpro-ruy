import { z } from "zod";

export const sendWhatsappMessageSchema = z.object({
  connectionId: z.string().uuid(),
  remotePhone: z.string().trim().min(1, {
    message: "Número de telefone é obrigatório.",
  }),
  content: z.string().trim().min(1, {
    message: "Conteúdo da mensagem é obrigatório.",
  }),
  messageType: z
    .enum(["text", "image", "audio", "video", "document", "location", "contact"])
    .optional()
    .default("text"),
});

export const sendWhatsappMediaSchema = z.object({
  connectionId: z.string().uuid(),
  remotePhone: z.string().trim().min(1, {
    message: "Número de telefone é obrigatório.",
  }),
  mediaBase64: z.string().min(1, {
    message: "Arquivo é obrigatório.",
  }),
  mediaType: z.enum(["image", "audio", "video", "document"]),
  mimeType: z.string().min(1),
  fileName: z.string().optional(),
  caption: z.string().optional(),
});

export type SendWhatsappMessageSchema = z.infer<
  typeof sendWhatsappMessageSchema
>;

export type SendWhatsappMediaSchema = z.infer<
  typeof sendWhatsappMediaSchema
>;
