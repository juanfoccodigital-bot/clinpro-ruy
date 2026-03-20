"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  whatsappConnectionsTable,
  whatsappContactsTable,
  whatsappConversationsTable,
  whatsappMessagesTable,
} from "@/db/schema";
import { getRequestInfo, logAuditEvent } from "@/lib/audit-logger";
import { EvolutionApiClient } from "@/lib/evolution-api";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { sendWhatsappMediaSchema, sendWhatsappMessageSchema } from "./schema";

export const sendWhatsappMessage = protectedWithClinicActionClient
  .schema(sendWhatsappMessageSchema)
  .action(async ({ parsedInput, ctx }) => {
    const connection = await db.query.whatsappConnectionsTable.findFirst({
      where: eq(whatsappConnectionsTable.id, parsedInput.connectionId),
    });

    if (!connection || connection.clinicId !== ctx.user.clinic.id) {
      throw new Error("Conexao WhatsApp nao encontrada.");
    }

    const client = new EvolutionApiClient({
      apiUrl: connection.apiUrl,
      apiKey: connection.apiKey,
      instanceName: connection.instanceName,
    });

    try {
      const result = await client.sendTextMessage(
        parsedInput.remotePhone,
        parsedInput.content,
      );

      await db.insert(whatsappMessagesTable).values({
        clinicId: ctx.user.clinic.id,
        connectionId: connection.id,
        remotePhone: parsedInput.remotePhone,
        direction: "outbound",
        messageType: "text",
        content: parsedInput.content,
        status: "sent",
        externalId: result?.key?.id || null,
        sentByUserId: ctx.user.id,
      });

      // Update or create conversation
      const existingConv =
        await db.query.whatsappConversationsTable.findFirst({
          where: and(
            eq(whatsappConversationsTable.clinicId, ctx.user.clinic.id),
            eq(whatsappConversationsTable.connectionId, connection.id),
            eq(whatsappConversationsTable.remotePhone, parsedInput.remotePhone),
          ),
        });

      if (existingConv) {
        await db
          .update(whatsappConversationsTable)
          .set({
            lastMessageContent: parsedInput.content,
            lastMessageAt: new Date(),
            lastMessageDirection: "outbound",
            isRead: true,
          })
          .where(eq(whatsappConversationsTable.id, existingConv.id));
      } else {
        let contact = await db.query.whatsappContactsTable.findFirst({
          where: and(
            eq(whatsappContactsTable.clinicId, ctx.user.clinic.id),
            eq(whatsappContactsTable.phoneNumber, parsedInput.remotePhone),
          ),
        });
        if (!contact) {
          const [newContact] = await db
            .insert(whatsappContactsTable)
            .values({
              clinicId: ctx.user.clinic.id,
              phoneNumber: parsedInput.remotePhone,
            })
            .returning();
          contact = newContact;
        }
        await db.insert(whatsappConversationsTable).values({
          clinicId: ctx.user.clinic.id,
          connectionId: connection.id,
          contactId: contact.id,
          remotePhone: parsedInput.remotePhone,
          lastMessageContent: parsedInput.content,
          lastMessageAt: new Date(),
          lastMessageDirection: "outbound",
          isRead: true,
        });
      }
    } catch {
      await db.insert(whatsappMessagesTable).values({
        clinicId: ctx.user.clinic.id,
        connectionId: connection.id,
        remotePhone: parsedInput.remotePhone,
        direction: "outbound",
        messageType: "text",
        content: parsedInput.content,
        status: "failed",
        sentByUserId: ctx.user.id,
      });
      throw new Error("Erro ao enviar mensagem.");
    }

    const { ipAddress, userAgent } = await getRequestInfo();
    await logAuditEvent({
      clinicId: ctx.user.clinic.id,
      userId: ctx.user.id,
      action: "create",
      module: "whatsapp",
      resourceId: parsedInput.connectionId,
      resourceType: "message",
      description: "Mensagem WhatsApp enviada",
      ipAddress,
      userAgent,
    });
    revalidatePath("/whatsapp");
  });

export const sendWhatsappMedia = protectedWithClinicActionClient
  .schema(sendWhatsappMediaSchema)
  .action(async ({ parsedInput, ctx }) => {
    const connection = await db.query.whatsappConnectionsTable.findFirst({
      where: eq(whatsappConnectionsTable.id, parsedInput.connectionId),
    });

    if (!connection || connection.clinicId !== ctx.user.clinic.id) {
      throw new Error("Conexao WhatsApp nao encontrada.");
    }

    const client = new EvolutionApiClient({
      apiUrl: connection.apiUrl,
      apiKey: connection.apiKey,
      instanceName: connection.instanceName,
    });

    const mediaLabel =
      parsedInput.mediaType === "image"
        ? "📷 Imagem"
        : parsedInput.mediaType === "audio"
          ? "🎵 Audio"
          : parsedInput.mediaType === "video"
            ? "🎬 Video"
            : "📄 Documento";

    try {
      // Audio uses a dedicated endpoint that handles format conversion (webm → ogg/opus)
      const result = parsedInput.mediaType === "audio"
        ? await client.sendAudioMessage(
            parsedInput.remotePhone,
            parsedInput.mediaBase64,
          )
        : await client.sendMediaMessage(
            parsedInput.remotePhone,
            parsedInput.mediaBase64,
            parsedInput.mimeType,
            parsedInput.mediaType,
            parsedInput.caption,
            parsedInput.fileName,
          );

      // Store as data URI for display
      const storedMediaUrl = `data:${parsedInput.mimeType};base64,${parsedInput.mediaBase64}`;

      await db.insert(whatsappMessagesTable).values({
        clinicId: ctx.user.clinic.id,
        connectionId: connection.id,
        remotePhone: parsedInput.remotePhone,
        direction: "outbound",
        messageType: parsedInput.mediaType,
        content: parsedInput.caption || "",
        mediaUrl: storedMediaUrl,
        status: "sent",
        externalId: result?.key?.id || null,
        sentByUserId: ctx.user.id,
      });

      // Update or create conversation
      const existingConv =
        await db.query.whatsappConversationsTable.findFirst({
          where: and(
            eq(whatsappConversationsTable.clinicId, ctx.user.clinic.id),
            eq(whatsappConversationsTable.connectionId, connection.id),
            eq(
              whatsappConversationsTable.remotePhone,
              parsedInput.remotePhone,
            ),
          ),
        });

      const displayContent = parsedInput.caption || mediaLabel;

      if (existingConv) {
        await db
          .update(whatsappConversationsTable)
          .set({
            lastMessageContent: displayContent,
            lastMessageAt: new Date(),
            lastMessageDirection: "outbound",
            isRead: true,
          })
          .where(eq(whatsappConversationsTable.id, existingConv.id));
      } else {
        let contact = await db.query.whatsappContactsTable.findFirst({
          where: and(
            eq(whatsappContactsTable.clinicId, ctx.user.clinic.id),
            eq(
              whatsappContactsTable.phoneNumber,
              parsedInput.remotePhone,
            ),
          ),
        });
        if (!contact) {
          const [newContact] = await db
            .insert(whatsappContactsTable)
            .values({
              clinicId: ctx.user.clinic.id,
              phoneNumber: parsedInput.remotePhone,
            })
            .returning();
          contact = newContact;
        }
        await db.insert(whatsappConversationsTable).values({
          clinicId: ctx.user.clinic.id,
          connectionId: connection.id,
          contactId: contact.id,
          remotePhone: parsedInput.remotePhone,
          lastMessageContent: displayContent,
          lastMessageAt: new Date(),
          lastMessageDirection: "outbound",
          isRead: true,
        });
      }
    } catch {
      await db.insert(whatsappMessagesTable).values({
        clinicId: ctx.user.clinic.id,
        connectionId: connection.id,
        remotePhone: parsedInput.remotePhone,
        direction: "outbound",
        messageType: parsedInput.mediaType,
        content: parsedInput.caption || "",
        status: "failed",
        sentByUserId: ctx.user.id,
      });
      throw new Error("Erro ao enviar midia.");
    }

    revalidatePath("/whatsapp");
  });
