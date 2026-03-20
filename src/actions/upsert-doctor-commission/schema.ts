import { z } from "zod";

export const upsertDoctorCommissionSchema = z.object({
  id: z.string().uuid().optional(),
  doctorId: z.string().uuid({
    message: "Profissional é obrigatório.",
  }),
  commissionPercentage: z
    .number()
    .min(0, { message: "Percentual deve ser no mínimo 0." })
    .max(100, { message: "Percentual deve ser no máximo 100." }),
});

export type UpsertDoctorCommissionSchema = z.infer<
  typeof upsertDoctorCommissionSchema
>;
