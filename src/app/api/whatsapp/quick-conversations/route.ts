import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { whatsappConversationsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.clinic?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await db.query.whatsappConversationsTable.findMany({
    where: eq(whatsappConversationsTable.clinicId, session.user.clinic.id),
    orderBy: [desc(whatsappConversationsTable.lastMessageAt)],
    limit: 15,
  });

  return NextResponse.json({
    conversations: conversations.map((c) => ({
      id: c.id,
      contactName: c.contactName,
      remotePhone: c.remotePhone,
      lastMessageContent: c.lastMessageContent,
      lastMessageAt: c.lastMessageAt?.toISOString() || null,
      unreadCount: c.unreadCount || 0,
      isRead: c.isRead,
    })),
  });
}
