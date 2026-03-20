import { z } from "zod";

export const upsertQuickReplySchema = z.object({
  id: z.string().uuid().optional(),
  shortcut: z.string().trim().min(1, {
    message: "Atalho é obrigatório.",
  }),
  content: z.string().trim().min(1, {
    message: "Conteúdo é obrigatório.",
  }),
});

export type UpsertQuickReplySchema = z.infer<typeof upsertQuickReplySchema>;
