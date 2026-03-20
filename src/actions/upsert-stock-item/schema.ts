import { z } from "zod";

export const upsertStockItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, {
    message: "Nome é obrigatório.",
  }),
  category: z.enum(
    [
      "medication",
      "material",
      "equipment",
      "epi",
      "cleaning",
      "office",
      "other",
    ],
    {
      required_error: "Categoria é obrigatória.",
    },
  ),
  sku: z.string().trim().optional(),
  currentQuantity: z.number().int().min(0).optional(),
  minimumQuantity: z.number().int().min(0).optional(),
  costInCents: z.number().int().min(0).optional(),
  expirationDate: z.string().optional(),
  location: z.string().trim().optional(),
  notes: z.string().optional(),
});

export type UpsertStockItemSchema = z.infer<typeof upsertStockItemSchema>;
