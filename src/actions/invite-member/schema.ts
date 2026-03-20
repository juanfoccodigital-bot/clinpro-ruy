import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().email("E-mail invalido"),
  role: z.enum(["admin", "member", "viewer"]),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
