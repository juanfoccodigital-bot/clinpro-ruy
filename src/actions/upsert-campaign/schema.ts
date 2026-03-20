import { z } from "zod";

export const upsertCampaignSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, {
    message: "Nome é obrigatório.",
  }),
  type: z.enum(
    ["birthday", "inactive", "follow_up", "promotional", "custom"],
    {
      required_error: "Tipo é obrigatório.",
    },
  ),
  channel: z.enum(["email", "sms", "whatsapp"], {
    required_error: "Canal é obrigatório.",
  }),
  subject: z.string().trim().optional(),
  template: z.string().trim().min(1, {
    message: "Template é obrigatório.",
  }),
  status: z
    .enum(["draft", "scheduled", "sending", "sent", "cancelled"])
    .optional(),
  scheduledFor: z.string().optional(),
  notes: z.string().optional(),
});

export type UpsertCampaignSchema = z.infer<typeof upsertCampaignSchema>;
