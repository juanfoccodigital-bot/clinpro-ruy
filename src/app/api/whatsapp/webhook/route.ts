import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import {
  crmContactActivitiesTable,
  crmContactStagesTable,
  crmPipelineStagesTable,
  patientsTable,
  whatsappConnectionsTable,
  whatsappContactsTable,
  whatsappConversationsTable,
  whatsappMessagesTable,
} from "@/db/schema";

export async function POST(request: NextRequest) {
  // Evolution API sends webhooks without custom auth headers
  // We validate by checking that the instanceName exists in our database

  try {
    const body = await request.json();
    const event = body.event;
    const instanceName = body.instance;

    console.log(
      `[WhatsApp Webhook] Event: ${event}, Instance: ${instanceName}`,
    );

    // ─── MESSAGES_UPSERT ────────────────────────────────────────────────
    if (event === "messages.upsert" || event === "MESSAGES_UPSERT") {
      const data = body.data;

      // Ignore status/system messages (status@broadcast)
      const remoteJid = data.key?.remoteJid || "";
      if (
        remoteJid.endsWith("@g.us") ||
        remoteJid.includes("@broadcast") ||
        remoteJid === "status@broadcast"
      ) {
        return NextResponse.json({ success: true });
      }

      // Ignore protocol/notification messages that have no actual content
      const msgType = data.messageType;
      if (
        msgType === "protocolMessage" ||
        msgType === "reactionMessage" ||
        msgType === "ephemeralMessage"
      ) {
        return NextResponse.json({ success: true });
      }

      const connection = await db.query.whatsappConnectionsTable.findFirst({
        where: eq(whatsappConnectionsTable.instanceName, instanceName),
      });

      if (!connection) {
        console.error(
          `[WhatsApp Webhook] Connection not found for instance: ${instanceName}`,
        );
        return NextResponse.json(
          { error: "Connection not found" },
          { status: 404 },
        );
      }

      const remotePhone = remoteJid.replace("@s.whatsapp.net", "");
      const isFromMe = data.key?.fromMe || false;

      // Skip saving outbound messages that were sent from this system
      // (they are already saved by the sendWhatsappMessage action)
      // But still process them for conversation updates
      const existingMessage = isFromMe && data.key?.id
        ? await db.query.whatsappMessagesTable.findFirst({
            where: eq(whatsappMessagesTable.externalId, data.key.id),
          })
        : null;

      // ── Determine message type and extract content/media ──
      // IMPORTANT: base64 is preferred over url/directPath because WhatsApp
      // internal URLs are encrypted and not publicly accessible
      let messageType:
        | "text"
        | "image"
        | "audio"
        | "video"
        | "document" = "text";
      let content = "";
      let mediaUrl: string | null = null;

      const msg = data.message;

      if (msg?.imageMessage) {
        messageType = "image";
        content = msg.imageMessage.caption || "";
        if (msg.imageMessage.base64) {
          const mime = msg.imageMessage.mimetype || "image/jpeg";
          mediaUrl = `data:${mime};base64,${msg.imageMessage.base64}`;
        }
      } else if (msg?.audioMessage) {
        messageType = "audio";
        content = "";
        if (msg.audioMessage.base64) {
          const mime = msg.audioMessage.mimetype || "audio/ogg";
          mediaUrl = `data:${mime};base64,${msg.audioMessage.base64}`;
        }
      } else if (msg?.videoMessage) {
        messageType = "video";
        content = msg.videoMessage.caption || "";
        if (msg.videoMessage.base64) {
          const mime = msg.videoMessage.mimetype || "video/mp4";
          mediaUrl = `data:${mime};base64,${msg.videoMessage.base64}`;
        }
      } else if (msg?.documentMessage || msg?.documentWithCaptionMessage?.message?.documentMessage) {
        messageType = "document";
        const doc = msg.documentMessage || msg.documentWithCaptionMessage.message.documentMessage;
        content = doc.fileName || doc.caption || "";
        if (doc.base64) {
          const mime = doc.mimetype || "application/octet-stream";
          mediaUrl = `data:${mime};base64,${doc.base64}`;
        }
      } else if (msg?.stickerMessage) {
        // Treat stickers as images
        messageType = "image";
        content = "";
        if (msg.stickerMessage.base64) {
          const mime = msg.stickerMessage.mimetype || "image/webp";
          mediaUrl = `data:${mime};base64,${msg.stickerMessage.base64}`;
        }
      } else if (msg?.conversation || msg?.extendedTextMessage) {
        messageType = "text";
        content = msg.conversation || msg.extendedTextMessage?.text || "";
      } else if (msg?.buttonsResponseMessage) {
        messageType = "text";
        content = msg.buttonsResponseMessage.selectedDisplayText || "";
      } else if (msg?.listResponseMessage) {
        messageType = "text";
        content = msg.listResponseMessage.title || msg.listResponseMessage.singleSelectReply?.selectedRowId || "";
      }

      // Fallback: check for base64 at message level (some Evolution API versions put it here)
      if (!mediaUrl && messageType !== "text" && msg?.base64) {
        const fallbackMimeMap: Record<string, string> = {
          audio: "audio/ogg",
          image: "image/jpeg",
          video: "video/mp4",
          document: "application/octet-stream",
        };
        const mime =
          msg.mimetype ||
          fallbackMimeMap[messageType] ||
          "application/octet-stream";
        mediaUrl = `data:${mime};base64,${msg.base64}`;
      }

      // Fallback 2: fetch media via Evolution API getBase64FromMediaMessage
      if (!mediaUrl && messageType !== "text" && data.key?.id && connection.apiUrl && connection.apiKey) {
        try {
          const mediaRes = await fetch(
            `${connection.apiUrl}/chat/getBase64FromMediaMessage/${connection.instanceName}`,
            {
              method: "POST",
              headers: { "apikey": connection.apiKey, "Content-Type": "application/json" },
              body: JSON.stringify({ message: { key: data.key }, convertToMp4: messageType === "video" }),
            }
          );
          const mediaData = await mediaRes.json();
          if (mediaData?.base64) {
            const mime = mediaData.mimetype || (messageType === "audio" ? "audio/ogg" : messageType === "image" ? "image/jpeg" : messageType === "video" ? "video/mp4" : "application/octet-stream");
            mediaUrl = `data:${mime};base64,${mediaData.base64}`;
          }
        } catch (mediaErr) {
          console.error("[WhatsApp Webhook] Error fetching media:", mediaErr);
        }
      }

      const direction = isFromMe ? "outbound" : "inbound";

      // Save message (only if not already saved by send action)
      if (!existingMessage) {
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
      }

      console.log(
        `[WhatsApp Webhook] Message ${existingMessage ? "already exists" : "saved"}: ${direction} ${remotePhone} (${messageType})`,
      );

      // ── Get or create contact ──
      let contact = await db.query.whatsappContactsTable.findFirst({
        where: and(
          eq(whatsappContactsTable.clinicId, connection.clinicId),
          eq(whatsappContactsTable.phoneNumber, remotePhone),
        ),
      });

      // Only use pushName from INBOUND messages (fromMe=false)
      // Outbound messages have the clinic's own profile name, not the contact's
      let pushName = !isFromMe ? (data.pushName || null) : null;
      const profilePicUrl = !isFromMe ? (data.profilePictureUrl || null) : null;

      // For outbound to unknown contacts, fetch name from Evolution contacts list
      if (isFromMe && connection.apiUrl && connection.apiKey) {
        try {
          const contactRes = await fetch(`${connection.apiUrl}/chat/findContacts/${connection.instanceName}`, {
            method: "POST",
            headers: { "apikey": connection.apiKey, "Content-Type": "application/json" },
            body: JSON.stringify({ where: { id: `${remotePhone}@s.whatsapp.net` } }),
          });
          const contactData = await contactRes.json();
          const found = Array.isArray(contactData) ? contactData[0] : null;
          if (found) {
            if (!pushName) pushName = found.pushName || found.name || found.notify || null;
          }
        } catch {}
      }

      if (!contact) {
        // Try to fetch profile picture from Evolution API
        let fetchedPic = profilePicUrl;
        if (!fetchedPic && connection.apiUrl && connection.apiKey) {
          try {
            const picRes = await fetch(`${connection.apiUrl}/chat/fetchProfilePictureUrl/${connection.instanceName}`, {
              method: "POST",
              headers: { "apikey": connection.apiKey, "Content-Type": "application/json" },
              body: JSON.stringify({ number: remotePhone }),
            });
            const picData = await picRes.json();
            fetchedPic = picData?.profilePictureUrl || picData?.pictureUrl || null;
          } catch {}
        }

        const [newContact] = await db
          .insert(whatsappContactsTable)
          .values({
            clinicId: connection.clinicId,
            phoneNumber: remotePhone,
            name: pushName,
            profilePictureUrl: fetchedPic,
          })
          .returning();
        contact = newContact;
      } else if (!isFromMe) {
        // Only update contact info from inbound messages
        const updates: Record<string, unknown> = {};
        if (
          pushName &&
          (!contact.name || contact.name === contact.phoneNumber)
        ) {
          updates.name = pushName;
        }
        if (profilePicUrl && contact.profilePictureUrl !== profilePicUrl) {
          updates.profilePictureUrl = profilePicUrl;
        }
        if (Object.keys(updates).length > 0) {
          await db
            .update(whatsappContactsTable)
            .set(updates)
            .where(eq(whatsappContactsTable.id, contact.id));
        }
      }

      // ── Auto-create patient and CRM lead ──
      try {
        const existingPatient = await db.query.patientsTable.findFirst({
          where: and(
            eq(patientsTable.clinicId, connection.clinicId),
            eq(patientsTable.phoneNumber, remotePhone),
          ),
        });

        if (!existingPatient && !isFromMe) {
          // Format phone number for display
          let formattedPhone = remotePhone;
          if (remotePhone.length === 13) {
            formattedPhone =
              "+" +
              remotePhone.slice(0, 2) +
              " " +
              remotePhone.slice(2, 4) +
              " " +
              remotePhone.slice(4, 9) +
              "-" +
              remotePhone.slice(9);
          }

          // Create patient
          const [newPatient] = await db
            .insert(patientsTable)
            .values({
              clinicId: connection.clinicId,
              name: pushName || formattedPhone,
              phoneNumber: formattedPhone,
              email: "",
              sex: "not_informed",
              leadSource: "whatsapp",
            })
            .returning();

          // Link WhatsApp contact to patient
          await db
            .update(whatsappContactsTable)
            .set({ patientId: newPatient.id })
            .where(eq(whatsappContactsTable.id, contact.id));

          // Add to CRM as first stage (Lead Novo)
          const firstStage =
            await db.query.crmPipelineStagesTable.findFirst({
              where: eq(
                crmPipelineStagesTable.clinicId,
                connection.clinicId,
              ),
              orderBy: (table, { asc }) => [asc(table.order)],
            });

          if (firstStage) {
            await db
              .insert(crmContactStagesTable)
              .values({
                clinicId: connection.clinicId,
                patientId: newPatient.id,
                stageId: firstStage.id,
              })
              .onConflictDoNothing();

            // Log activity
            await db.insert(crmContactActivitiesTable).values({
              clinicId: connection.clinicId,
              patientId: newPatient.id,
              type: "contact_created",
              description: "Lead criado automaticamente via WhatsApp",
              metadata: { source: "whatsapp", phone: remotePhone },
            });
          }

          console.log(
            `[WhatsApp Webhook] Auto-created patient and CRM lead for ${remotePhone}`,
          );
        } else if (existingPatient && !contact.patientId) {
          // Link existing patient to WhatsApp contact
          await db
            .update(whatsappContactsTable)
            .set({ patientId: existingPatient.id })
            .where(eq(whatsappContactsTable.id, contact.id));

          console.log(
            `[WhatsApp Webhook] Linked existing patient to WhatsApp contact ${remotePhone}`,
          );
        }
      } catch (crmError) {
        console.error(
          "[WhatsApp Webhook] Error creating patient/CRM lead:",
          crmError,
        );
        // Don't fail the webhook for CRM errors
      }

      // ── Update or create conversation ──
      const existingConv =
        await db.query.whatsappConversationsTable.findFirst({
          where: and(
            eq(whatsappConversationsTable.clinicId, connection.clinicId),
            eq(whatsappConversationsTable.connectionId, connection.id),
            eq(whatsappConversationsTable.remotePhone, remotePhone),
          ),
        });

      // Build display content for conversation preview
      let lastContent: string;
      if (content) {
        lastContent = content;
      } else {
        switch (messageType) {
          case "image":
            lastContent = "Imagem";
            break;
          case "audio":
            lastContent = "Audio";
            break;
          case "video":
            lastContent = "Video";
            break;
          case "document":
            lastContent = "Documento";
            break;
          default:
            lastContent = "Midia";
        }
      }

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

    // ─── CONNECTION_UPDATE ──────────────────────────────────────────────
    if (event === "connection.update" || event === "CONNECTION_UPDATE") {
      const state = body.data?.state;

      if (instanceName && state) {
        const statusMap: Record<
          string,
          "connected" | "disconnected" | "connecting"
        > = {
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
            .set({ status: statusMap[state] })
            .where(eq(whatsappConnectionsTable.id, connection.id));
          console.log(
            `[WhatsApp Webhook] Connection ${instanceName} status: ${statusMap[state]}`,
          );
        }
      }
    }

    // ─── QRCODE_UPDATED ────────────────────────────────────────────────
    if (event === "qrcode.updated" || event === "QRCODE_UPDATED") {
      console.log(
        `[WhatsApp Webhook] QR Code updated for instance: ${instanceName}`,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WhatsApp Webhook] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
