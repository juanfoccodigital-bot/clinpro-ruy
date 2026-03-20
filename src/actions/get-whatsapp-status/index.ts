"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { whatsappConnectionsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getWhatsappStatus(): Promise<
  "connected" | "disconnected" | null
> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.clinic?.id) return null;

  const connections = await db.query.whatsappConnectionsTable.findMany({
    where: eq(whatsappConnectionsTable.clinicId, session.user.clinic.id),
  });

  if (connections.length === 0) return null;

  const hasConnected = connections.some((c) => c.status === "connected");
  return hasConnected ? "connected" : "disconnected";
}
