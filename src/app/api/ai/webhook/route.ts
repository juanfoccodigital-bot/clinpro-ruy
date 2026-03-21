import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { clinicsTable, whatsappConnectionsTable } from "@/db/schema";
import { processIncomingMessage } from "@/lib/ai/agent";
import { EvolutionApiClient } from "@/lib/evolution-api";

export async function POST(request: NextRequest) {
  // Verify webhook authenticity
  const webhookSecret = process.env.AI_WEBHOOK_SECRET;
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
    const { instanceName, phoneNumber, message } = body;

    if (!instanceName || !phoneNumber || !message) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 },
      );
    }

    // Find the connection and clinic
    const connection = await db.query.whatsappConnectionsTable.findFirst({
      where: eq(whatsappConnectionsTable.instanceName, instanceName),
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Conexao nao encontrada" },
        { status: 404 },
      );
    }

    const clinic = await db.query.clinicsTable.findFirst({
      where: eq(clinicsTable.id, connection.clinicId),
    });

    if (!clinic) {
      return NextResponse.json(
        { error: "Clinica nao encontrada" },
        { status: 404 },
      );
    }

    // Process with AI
    const result = await processIncomingMessage({
      clinicId: connection.clinicId,
      clinicName: clinic.name,
      phoneNumber,
      messageContent: message,
    });

    if (!result) {
      return NextResponse.json({ aiActive: false });
    }

    // Send response via WhatsApp
    const client = new EvolutionApiClient({
      apiUrl: connection.apiUrl,
      apiKey: connection.apiKey,
      instanceName: connection.instanceName,
    });

    await client.sendTextMessage(phoneNumber, result.response);

    return NextResponse.json({
      success: true,
      conversationId: result.conversationId,
    });
  } catch (error) {
    console.error("AI webhook error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
