"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { whatsappConnectionsTable } from "@/db/schema";
import { getRequestInfo, logAuditEvent } from "@/lib/audit-logger";
import { EvolutionApiClient } from "@/lib/evolution-api";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const createWhatsappInstance = protectedWithClinicActionClient
  .schema(
    z.object({
      instanceName: z.string().trim().min(1),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error("Evolution API nao configurada.");
    }

    const client = new EvolutionApiClient({
      apiUrl,
      apiKey,
      instanceName: parsedInput.instanceName,
    });

    // Build webhook URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${appUrl}/api/whatsapp/webhook`;
    console.log(`[WhatsApp] Creating instance with webhook: ${webhookUrl}`);

    // Create instance on Evolution API (with webhook inline)
    const result = await client.createInstance(webhookUrl);

    // Save connection in DB
    await db.insert(whatsappConnectionsTable).values({
      clinicId: ctx.user.clinic.id,
      instanceName: parsedInput.instanceName,
      apiUrl,
      apiKey,
      status: "connecting",
    });

    // Fallback: set webhook separately after a delay (in case inline didn't work)
    setTimeout(async () => {
      try {
        await client.setWebhook(webhookUrl);
        console.log(`[WhatsApp] Webhook confirmed via setWebhook: ${webhookUrl}`);
      } catch (err) {
        console.error(`[WhatsApp] setWebhook fallback failed:`, err);
      }
    }, 3000);

    const { ipAddress, userAgent } = await getRequestInfo();
    await logAuditEvent({
      clinicId: ctx.user.clinic.id,
      userId: ctx.user.id,
      action: "create",
      module: "whatsapp",
      resourceType: "connection",
      description: "Conexao WhatsApp criada",
      ipAddress,
      userAgent,
    });
    revalidatePath("/whatsapp");

    // Return QR code
    return {
      qrCode: result?.qrcode?.base64 || result?.base64 || null,
      instanceName: parsedInput.instanceName,
    };
  });
