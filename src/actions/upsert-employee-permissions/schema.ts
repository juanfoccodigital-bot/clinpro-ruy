import { z } from "zod";

export const upsertEmployeePermissionsSchema = z.object({
  employeeId: z.string().uuid({
    message: "Funcionário é obrigatório.",
  }),
  permissions: z.array(
    z.object({
      module: z.enum(
        [
          "dashboard",
          "appointments",
          "agenda",
          "doctors",
          "patients",
          "medical_records",
          "documents",
          "financial",
          "insurance",
          "stock",
          "employees",
          "reports",
          "settings",
        ],
        {
          required_error: "Módulo é obrigatório.",
        },
      ),
      canView: z.boolean(),
      canCreate: z.boolean(),
      canEdit: z.boolean(),
      canDelete: z.boolean(),
    }),
  ),
});

export type UpsertEmployeePermissionsSchema = z.infer<
  typeof upsertEmployeePermissionsSchema
>;
