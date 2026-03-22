import { z } from "zod";

export const addAppointmentSchema = z.object({
  patientId: z.string().uuid({
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().uuid().optional(),
  date: z.date({
    message: "Data é obrigatória.",
  }),
  time: z.string().min(1, {
    message: "Horário é obrigatório.",
  }),
  appointmentPriceInCents: z.number().min(0, {
    message: "Valor do procedimento é obrigatório.",
  }),
  procedureId: z.string().uuid().optional(),
  notes: z.string().optional(),
});
