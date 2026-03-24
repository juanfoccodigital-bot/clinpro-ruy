import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, image } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    name: name.trim(),
  };

  // If image is provided (base64 data URL), save it
  if (image !== undefined) {
    updates.image = image;
  }

  await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, session.user.id));

  return NextResponse.json({ success: true });
}
