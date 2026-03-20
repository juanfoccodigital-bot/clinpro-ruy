export type TriageCategory =
  | "emergency"
  | "scheduling"
  | "information"
  | "complaint"
  | "other";

export interface TriageResult {
  category: TriageCategory;
  confidence: number;
  shouldEscalate: boolean;
}

export function triageMessage(content: string): TriageResult {
  const lower = content.toLowerCase();

  // Emergency keywords
  const emergencyKeywords = [
    "emergencia",
    "urgente",
    "sangramento",
    "desmaio",
    "nao consigo respirar",
    "infarto",
    "avc",
    "convulsao",
  ];
  if (emergencyKeywords.some((kw) => lower.includes(kw))) {
    return { category: "emergency", confidence: 0.95, shouldEscalate: true };
  }

  // Scheduling keywords
  const schedulingKeywords = [
    "agendar",
    "marcar",
    "remarcar",
    "cancelar",
    "consulta",
    "horario",
    "disponivel",
    "vaga",
  ];
  if (schedulingKeywords.some((kw) => lower.includes(kw))) {
    return { category: "scheduling", confidence: 0.85, shouldEscalate: false };
  }

  // Information keywords
  const infoKeywords = [
    "endereco",
    "telefone",
    "como chegar",
    "estacionamento",
    "convenio",
    "plano",
    "aceita",
    "valor",
    "preco",
  ];
  if (infoKeywords.some((kw) => lower.includes(kw))) {
    return { category: "information", confidence: 0.8, shouldEscalate: false };
  }

  // Complaint keywords
  const complaintKeywords = [
    "reclamacao",
    "insatisfeito",
    "problema",
    "demora",
    "atraso",
    "pessimo",
  ];
  if (complaintKeywords.some((kw) => lower.includes(kw))) {
    return { category: "complaint", confidence: 0.75, shouldEscalate: true };
  }

  return { category: "other", confidence: 0.5, shouldEscalate: false };
}
