import { z } from "zod";

export const upsertWhatsappConnectionSchema = z.object({
  id: z.string().uuid().optional(),
  instanceName: z.string().trim().min(1, {
    message: "Nome da instância é obrigatório.",
  }),
  phoneNumber: z.string().trim().optional(),
  apiUrl: z.string().url({
    message: "URL da API inválida.",
  }),
  apiKey: z.string().trim().min(1, {
    message: "Chave da API é obrigatória.",
  }),
});

export type UpsertWhatsappConnectionSchema = z.infer<
  typeof upsertWhatsappConnectionSchema
>;
