"use server";

import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clinicInvitationsTable, usersToClinicsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { inviteMemberSchema } from "./schema";

export const inviteMember = protectedWithClinicActionClient
  .schema(inviteMemberSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Check if user has permission to invite (owner or admin)
    const membership = await db.query.usersToClinicsTable.findFirst({
      where: and(
        eq(usersToClinicsTable.userId, ctx.user.id),
        eq(usersToClinicsTable.clinicId, ctx.user.clinic.id),
      ),
    });

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Sem permissao para convidar membros");
    }

    // Check for existing pending invitation
    const existingInvite = await db.query.clinicInvitationsTable.findFirst({
      where: and(
        eq(clinicInvitationsTable.clinicId, ctx.user.clinic.id),
        eq(clinicInvitationsTable.email, parsedInput.email),
        eq(clinicInvitationsTable.status, "pending"),
      ),
    });

    if (existingInvite) {
      throw new Error("Ja existe um convite pendente para este e-mail");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    await db.insert(clinicInvitationsTable).values({
      clinicId: ctx.user.clinic.id,
      invitedByUserId: ctx.user.id,
      email: parsedInput.email,
      role: parsedInput.role,
      token,
      expiresAt,
    });

    revalidatePath("/configuracoes");
    return { success: true, token };
  });
