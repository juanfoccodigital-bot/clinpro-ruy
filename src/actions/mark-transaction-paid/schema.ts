import { z } from "zod";

export const markTransactionPaidSchema = z.object({
  id: z.string().uuid({
    message: "Transação é obrigatória.",
  }),
  paymentMethod: z
    .enum([
      "cash",
      "credit_card",
      "debit_card",
      "pix",
      "bank_transfer",
      "health_insurance",
      "other",
    ])
    .optional(),
  paymentDate: z.string().optional(),
});

export type MarkTransactionPaidSchema = z.infer<
  typeof markTransactionPaidSchema
>;
