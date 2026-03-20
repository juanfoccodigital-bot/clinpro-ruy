import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  aiAgentConfigTable,
  aiConversationsTable,
  aiMessagesTable,
} from "@/db/schema";

import { getDefaultSystemPrompt } from "./prompts";
import { lookupPatient } from "./tools";

interface ProcessMessageParams {
  clinicId: string;
  clinicName: string;
  phoneNumber: string;
  messageContent: string;
}

interface ProcessMessageResult {
  response: string;
  conversationId: string;
}

export async function processIncomingMessage({
  clinicId,
  clinicName,
  phoneNumber,
  messageContent,
}: ProcessMessageParams): Promise<ProcessMessageResult | null> {
  // 1. Check if AI agent is active for this clinic
  const config = await db.query.aiAgentConfigTable.findFirst({
    where: eq(aiAgentConfigTable.clinicId, clinicId),
  });

  if (!config?.isActive) return null;

  // 2. Find or create conversation
  let conversation = await db.query.aiConversationsTable.findFirst({
    where: and(
      eq(aiConversationsTable.clinicId, clinicId),
      eq(aiConversationsTable.phoneNumber, phoneNumber),
      eq(aiConversationsTable.status, "active"),
    ),
    with: { messages: true },
  });

  if (!conversation) {
    // Try to match patient by phone
    const patient = await lookupPatient(clinicId, phoneNumber);

    const [newConversation] = await db
      .insert(aiConversationsTable)
      .values({
        clinicId,
        phoneNumber,
        patientId: patient?.id || null,
        status: "active",
      })
      .returning();

    conversation = { ...newConversation, messages: [] };
  }

  // 3. Save user message
  await db.insert(aiMessagesTable).values({
    clinicId,
    conversationId: conversation.id,
    role: "user",
    content: messageContent,
  });

  // 4. Generate AI response
  // In production, this would call OpenAI/Anthropic API
  // For now, generate a contextual placeholder response
  const systemPrompt =
    config.systemPrompt || getDefaultSystemPrompt(clinicName);

  const response = generatePlaceholderResponse(
    messageContent,
    systemPrompt,
    config,
  );

  // 5. Save assistant message
  await db.insert(aiMessagesTable).values({
    clinicId,
    conversationId: conversation.id,
    role: "assistant",
    content: response,
    tokensUsed: Math.ceil(response.length / 4), // approximate
  });

  return {
    response,
    conversationId: conversation.id,
  };
}

function generatePlaceholderResponse(
  userMessage: string,
  _systemPrompt: string,
  config: { enableScheduling: boolean; enableGreeting: boolean },
): string {
  const lowerMessage = userMessage.toLowerCase();

  // Emergency detection
  if (
    lowerMessage.includes("emergencia") ||
    lowerMessage.includes("urgente") ||
    lowerMessage.includes("sangramento") ||
    lowerMessage.includes("nao consigo respirar")
  ) {
    return "Detectei uma possivel emergencia. Por favor, ligue imediatamente para o SAMU: 192. Se estiver em risco, va ao pronto-socorro mais proximo.";
  }

  // Greeting
  if (
    config.enableGreeting &&
    (lowerMessage.includes("ola") ||
      lowerMessage.includes("oi") ||
      lowerMessage.includes("bom dia") ||
      lowerMessage.includes("boa tarde") ||
      lowerMessage.includes("boa noite"))
  ) {
    return "Ola! Sou a Secretar.IA, assistente virtual da clinica. Como posso ajudar? Posso verificar horarios disponiveis, agendar consultas ou fornecer informacoes sobre nossos servicos.";
  }

  // Scheduling intent
  if (
    config.enableScheduling &&
    (lowerMessage.includes("agendar") ||
      lowerMessage.includes("marcar") ||
      lowerMessage.includes("consulta") ||
      lowerMessage.includes("horario"))
  ) {
    return "Claro! Vou ajudar com o agendamento. Para qual especialidade ou profissional voce gostaria de agendar? E qual sua preferencia de data e horario?";
  }

  // Default
  return "Entendi sua mensagem. Para melhor atende-lo, vou encaminhar sua solicitacao para nossa equipe. Um atendente entrara em contato em breve. Obrigado pela paciencia!";
}
