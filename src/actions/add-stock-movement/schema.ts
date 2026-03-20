import { z } from "zod";

export const addStockMovementSchema = z.object({
  stockItemId: z.string().uuid({
    message: "Item de estoque é obrigatório.",
  }),
  type: z.enum(["entry", "exit", "adjustment"], {
    required_error: "Tipo de movimentação é obrigatório.",
  }),
  quantity: z.number().int().positive({
    message: "Quantidade deve ser um número positivo.",
  }),
  batch: z.string().trim().optional(),
  notes: z.string().optional(),
});

export type AddStockMovementSchema = z.infer<typeof addStockMovementSchema>;
