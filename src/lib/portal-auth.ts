import bcrypt from "bcryptjs";
import crypto from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import { patientPortalTokensTable, patientUsersTable } from "@/db/schema";

const PORTAL_COOKIE_NAME = "portal_session";
const TOKEN_EXPIRY_HOURS = 24;

export async function authenticatePatient(email: string, password: string) {
  const patientUser = await db.query.patientUsersTable.findFirst({
    where: and(
      eq(patientUsersTable.email, email.toLowerCase()),
      eq(patientUsersTable.isActive, true),
    ),
    with: { patient: true },
  });

  if (!patientUser) return null;

  const isValid = await bcrypt.compare(password, patientUser.passwordHash);
  if (!isValid) return null;

  // Update lastLoginAt
  await db
    .update(patientUsersTable)
    .set({ lastLoginAt: new Date() })
    .where(eq(patientUsersTable.id, patientUser.id));

  // Create a session token
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await db.insert(patientPortalTokensTable).values({
    patientUserId: patientUser.id,
    token,
    expiresAt,
  });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(PORTAL_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/portal",
  });

  return { patientUser, token };
}

export async function getPortalSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) return null;

  const portalToken = await db.query.patientPortalTokensTable.findFirst({
    where: and(
      eq(patientPortalTokensTable.token, token),
      gt(patientPortalTokensTable.expiresAt, new Date()),
    ),
    with: {
      patientUser: {
        with: { patient: true },
      },
    },
  });

  if (!portalToken) return null;

  return {
    patientUser: portalToken.patientUser,
    patient: portalToken.patientUser.patient,
  };
}

export async function logoutPatient() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_COOKIE_NAME)?.value;
  if (token) {
    await db
      .delete(patientPortalTokensTable)
      .where(eq(patientPortalTokensTable.token, token));
    cookieStore.delete(PORTAL_COOKIE_NAME);
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
