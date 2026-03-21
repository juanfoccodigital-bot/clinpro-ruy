import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import {
  whatsappConnectionsTable,
  whatsappContactsTable,
  whatsappConversationsTable,
  whatsappMessagesTable,
} from "@/db/schema";

export async function POST(request: NextRequest) {
  // Verify webhook authenticity
  const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = request.headers.get("x-webhook-secret") || request.headers.get("authorization");
    if (signature !== webhookSecret && signature !== `Bearer ${webhookSecret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const event = body.event;
    const instanceName = body.instance;

    // console.log(`[WhatsApp Webhook] Event: ${event}, Instance: ${instanceName}`);

    if (event === "messages.upsert" || event === "MESSAGES_UPSERT") {
      const data = body.data;

      // Ignore group messages (JIDs ending with @g.us)
      const remoteJid = data.key?.remoteJid || "";
      if (remoteJid.endsWith("@g.us") || remoteJid.includes("@broadcast")) {
        // console.log(`[WhatsApp Webhook] Ignoring group/broadcast message from: ${remoteJid}`);
        return NextResponse.json({ success: true });
      }

      const connection = await db.query.whatsappConnectionsTable.findFirst({
        where: eq(whatsappConnectionsTable.instanceName, instanceName),
      });

      if (!connection) {
        console.error(`[WhatsApp Webhook] Connection not found for instance: ${instanceName}`);
        return NextResponse.json(
          { error: "Connection not found" },
          { status: 404 },
        );
      }

      const remotePhone = remoteJid.replace("@s.whatsapp.net", "");
      const isFromMe = data.key?.fromMe || false;

      // Determine message type and extract content/media
      // IMPORTANT: base64 is preferred over url/directPath because WhatsApp
      // internal URLs are encrypted and not publicly accessible
      let messageType: "text" | "image" | "audio" | "video" | "document" = "text";
      let content = "";
      let mediaUrl: string | null = null;

      if (data.message?.imageMessage) {
        messageType = "image";
        content = data.message.imageMessage.caption || "";
        const img = data.message.imageMessage;
        if (img.base64) {
          mediaUrl = `data:${img.mimetype || "image/jpeg"};base64,${img.base64}`;
        }
      } else if (data.message?.audioMessage) {
        messageType = "audio";
        const aud = data.message.audioMessage;
        if (aud.base64) {
          mediaUrl = `data:${aud.mimetype || "audio/ogg"};base64,${aud.base64}`;
        }
      } else if (data.message?.videoMessage) {
        messageType = "video";
        content = data.message.videoMessage.caption || "";
        const vid = data.message.videoMessage;
        if (vid.base64) {
          mediaUrl = `data:${vid.mimetype || "video/mp4"};base64,${vid.base64}`;
        }
      } else if (data.message?.documentMessage) {
        messageType = "document";
        const doc = data.message.documentMessage;
        content = doc.fileName || doc.caption || "";
        if (doc.base64) {
          mediaUrl = `data:${doc.mimetype || "application/octet-stream"};base64,${doc.base64}`;
        }
      } else {
        content = data.message?.conversation
          || data.message?.extendedTextMessage?.text
          || "";
      }

      // Fallback: check for base64 at message level (some Evolution API versions)
      if (!mediaUrl && messageType !== "text" && data.message?.base64) {
        const fallbackMimeMap: Record<string, string> = {
          audio: "audio/ogg",
          image: "image/jpeg",
          video: "video/mp4",
          document: "application/octet-stream",
        };
        const mime = data.message?.mimetype || fallbackMimeMap[messageType] || "application/octet-stream";
        mediaUrl = `data:${mime};base64,${data.message.base64}`;
      }

      const direction = isFromMe ? "outbound" : "inbound";

      // Save message
      await db.insert(whatsappMessagesTable).values({
        clinicId: connection.clinicId,
        connectionId: connection.id,
        remotePhone,
        direction,
        messageType,
        content,
        mediaUrl,
        status: isFromMe ? "sent" : "delivered",
        externalId: data.key?.id || null,
      });

      // console.log(`[WhatsApp Webhook] Message saved: ${direction} from ${remotePhone} (${messageType})`);

      // Get or create contact
      let contact = await db.query.whatsappContactsTable.findFirst({
        where: and(
          eq(whatsappContactsTable.clinicId, connection.clinicId),
          eq(whatsappContactsTable.phoneNumber, remotePhone),
        ),
      });

      const pushName = data.pushName || null;

      if (!contact) {
        const [newContact] = await db
          .insert(whatsappContactsTable)
          .values({
            clinicId: connection.clinicId,
            phoneNumber: remotePhone,
            name: pushName,
          })
          .returning();
        contact = newContact;
      } else if (pushName && (!contact.name || contact.name === contact.phoneNumber)) {
        // Update name if pushName exists and contact has no name or name is just the phone number
        await db
          .update(whatsappContactsTable)
          .set({ name: pushName })
          .where(eq(whatsappContactsTable.id, contact.id));
      }

      // Update or create conversation
      const existingConv =
        await db.query.whatsappConversationsTable.findFirst({
          where: and(
            eq(whatsappConversationsTable.clinicId, connection.clinicId),
            eq(whatsappConversationsTable.connectionId, connection.id),
            eq(whatsappConversationsTable.remotePhone, remotePhone),
          ),
        });

      const lastContent = content
        || (messageType === "image" ? "📷 Imagem" : "")
        || (messageType === "audio" ? "🎵 Audio" : "")
        || (messageType === "video" ? "🎬 Video" : "")
        || (messageType === "document" ? "📄 Documento" : "")
        || "Midia";

      if (existingConv) {
        const updateData: Record<string, unknown> = {
          lastMessageContent: lastContent,
          lastMessageAt: new Date(),
          lastMessageDirection: direction,
          contactName: pushName || existingConv.contactName,
          contactId: contact.id,
        };

        if (!isFromMe) {
          updateData.isRead = false;
          updateData.unreadCount = (existingConv.unreadCount || 0) + 1;
        }

        await db
          .update(whatsappConversationsTable)
          .set(updateData)
          .where(eq(whatsappConversationsTable.id, existingConv.id));
      } else {
        await db.insert(whatsappConversationsTable).values({
          clinicId: connection.clinicId,
          connectionId: connection.id,
          contactId: contact.id,
          remotePhone,
          contactName: pushName,
          lastMessageContent: lastContent,
          lastMessageAt: new Date(),
          lastMessageDirection: direction,
          isRead: isFromMe,
          unreadCount: isFromMe ? 0 : 1,
        });
      }
    }

    if (event === "connection.update" || event === "CONNECTION_UPDATE") {
      const instanceName = body.instance;
      const state = body.data?.state;

      if (instanceName && state) {
        const statusMap: Record<string, string> = {
          open: "connected",
          close: "disconnected",
          connecting: "connecting",
        };

        const connection = await db.query.whatsappConnectionsTable.findFirst({
          where: eq(whatsappConnectionsTable.instanceName, instanceName),
        });

        if (connection && statusMap[state]) {
          await db
            .update(whatsappConnectionsTable)
            .set({
              status: statusMap[state] as
                | "connected"
                | "disconnected"
                | "connecting",
            })
            .where(eq(whatsappConnectionsTable.id, connection.id));
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
