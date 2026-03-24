import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { whatsappConnectionsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { connectionId, signatureText, signatureEnabled } = body;

  if (!connectionId) {
    return NextResponse.json({ error: "Missing connectionId" }, { status: 400 });
  }

  const connection = await db.query.whatsappConnectionsTable.findFirst({
    where: eq(whatsappConnectionsTable.id, connectionId),
  });

  if (!connection || connection.clinicId !== session.user.clinic.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db
    .update(whatsappConnectionsTable)
    .set({
      signatureText: signatureText || null,
      signatureEnabled: signatureEnabled ?? true,
    })
    .where(eq(whatsappConnectionsTable.id, connectionId));

  return NextResponse.json({ success: true });
}
