import { z } from "zod";

export const updateAppointmentStatusSchema = z.object({
  id: z.string().uuid({
    message: "Agendamento é obrigatório.",
  }),
  status: z.enum(
    [
      "scheduled",
      "confirmed",
      "arrived",
      "in_service",
      "completed",
      "cancelled",
      "no_show",
    ],
    {
      required_error: "Status é obrigatório.",
    },
  ),
});

export type UpdateAppointmentStatusSchema = z.infer<
  typeof updateAppointmentStatusSchema
>;
