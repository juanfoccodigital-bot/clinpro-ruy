"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { clinicInvitationsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const revokeInvitation = protectedWithClinicActionClient
  .schema(z.object({ invitationId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    await db
      .update(clinicInvitationsTable)
      .set({ status: "expired" })
      .where(
        and(
          eq(clinicInvitationsTable.id, parsedInput.invitationId),
          eq(clinicInvitationsTable.clinicId, ctx.user.clinic.id),
          eq(clinicInvitationsTable.status, "pending"),
        ),
      );

    revalidatePath("/configuracoes");
    return { success: true };
  });
