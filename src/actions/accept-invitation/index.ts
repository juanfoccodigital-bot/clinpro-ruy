"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { clinicInvitationsTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const acceptInvitation = async (token: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const invitation = await db.query.clinicInvitationsTable.findFirst({
    where: and(
      eq(clinicInvitationsTable.token, token),
      eq(clinicInvitationsTable.status, "pending"),
    ),
  });

  if (!invitation) {
    throw new Error("Convite nao encontrado ou ja utilizado");
  }

  if (new Date() > invitation.expiresAt) {
    await db
      .update(clinicInvitationsTable)
      .set({ status: "expired" })
      .where(eq(clinicInvitationsTable.id, invitation.id));
    throw new Error("Convite expirado");
  }

  // Check if user is already a member
  const existingMembership = await db.query.usersToClinicsTable.findFirst({
    where: and(
      eq(usersToClinicsTable.userId, session.user.id),
      eq(usersToClinicsTable.clinicId, invitation.clinicId),
    ),
  });

  if (existingMembership) {
    throw new Error("Voce ja e membro desta clinica");
  }

  // Add user to clinic
  await db.insert(usersToClinicsTable).values({
    userId: session.user.id,
    clinicId: invitation.clinicId,
    role: invitation.role,
  });

  // Mark invitation as accepted
  await db
    .update(clinicInvitationsTable)
    .set({ status: "accepted", acceptedAt: new Date() })
    .where(eq(clinicInvitationsTable.id, invitation.id));

  redirect("/dashboard");
};
