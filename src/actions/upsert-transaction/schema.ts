import { z } from "zod";

export const upsertTransactionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["income", "expense"], {
    required_error: "Tipo é obrigatório.",
  }),
  category: z.enum(
    [
      "consultation",
      "exam",
      "procedure",
      "medication",
      "salary",
      "rent",
      "utilities",
      "supplies",
      "equipment",
      "marketing",
      "taxes",
      "insurance",
      "maintenance",
      "other",
    ],
    {
      required_error: "Categoria é obrigatória.",
    },
  ),
  description: z.string().trim().min(1, {
    message: "Descrição é obrigatória.",
  }),
  amountInCents: z.number().positive({
    message: "Valor deve ser positivo.",
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
  status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
  dueDate: z.string().optional(),
  paymentDate: z.string().optional(),
  patientId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  notes: z.string().optional(),
  paymentMachineId: z.string().uuid().optional(),
  installments: z.number().int().min(1).max(12).optional(),
  feePercentage: z.string().optional(),
  feeAmount: z.number().int().optional(),
  netAmount: z.number().int().optional(),
});

export type UpsertTransactionSchema = z.infer<typeof upsertTransactionSchema>;
