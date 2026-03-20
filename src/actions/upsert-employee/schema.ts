import { z } from "zod";

export const upsertEmployeeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, {
    message: "Nome é obrigatório.",
  }),
  email: z.string().email({ message: "E-mail inválido." }).optional(),
  phoneNumber: z.string().trim().optional(),
  cpf: z.string().trim().optional(),
  role: z.enum(
    ["admin", "doctor", "receptionist", "nurse", "manager", "other"],
    {
      required_error: "Cargo é obrigatório.",
    },
  ),
  specialty: z.string().trim().optional(),
  doctorId: z.string().uuid().optional(),
  hireDate: z.string().optional(),
  salary: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

export type UpsertEmployeeSchema = z.infer<typeof upsertEmployeeSchema>;
