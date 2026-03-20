export type PlanId = "starter" | "professional" | "enterprise";

export interface PlanFeatures {
  maxDoctors: number;
  maxPatients: number;
  maxEmployees: number;
  modules: string[];
}

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  priceInCents: number;
  features: PlanFeatures;
  highlights: string[];
  recommended?: boolean;
}

// All available module IDs
export const ALL_MODULES = [
  "dashboard",
  "appointments",
  "agenda",
  "doctors",
  "patients",
  "medical_records",
  "documents",
  "financial",
  "stock",
  "employees",
  "crm",
  "whatsapp",
  "secretaria_ia",
  "marketing_traffic",
  "marketing_campaigns",
  "reports",
  "lgpd",
  "settings",
] as const;

export type ModuleId = (typeof ALL_MODULES)[number];

// Module display labels (Portuguese)
export const MODULE_LABELS: Record<ModuleId, string> = {
  dashboard: "Dashboard",
  appointments: "Agendamentos",
  agenda: "Agenda",
  doctors: "Profissionais",
  patients: "Pacientes",
  medical_records: "Prontuarios",
  documents: "Documentos",
  financial: "Financeiro",
  stock: "Estoque",
  employees: "Funcionarios",
  crm: "CRM / Contatos",
  whatsapp: "WhatsApp",
  secretaria_ia: "Secretar.IA",
  marketing_traffic: "Trafego Pago",
  marketing_campaigns: "Campanhas",
  reports: "Relatorios",
  lgpd: "LGPD",
  settings: "Configuracoes",
};

// Module to route mapping for gating
export const MODULE_ROUTES: Record<ModuleId, string[]> = {
  dashboard: ["/dashboard"],
  appointments: ["/appointments"],
  agenda: ["/agenda"],
  doctors: ["/doctors"],
  patients: ["/patients"],
  medical_records: ["/patients/"],
  documents: ["/documents"],
  financial: ["/financeiro"],
  stock: ["/estoque"],
  employees: ["/funcionarios"],
  crm: ["/crm"],
  whatsapp: ["/whatsapp"],
  secretaria_ia: ["/secretaria-ia"],
  marketing_traffic: ["/marketing/trafego"],
  marketing_campaigns: ["/marketing/campanhas"],
  reports: ["/relatorios"],
  lgpd: ["/configuracoes/lgpd"],
  settings: ["/configuracoes"],
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Para profissionais autonomos ou pequenas clinicas",
    priceInCents: 5900,
    features: {
      maxDoctors: 3,
      maxPatients: 500,
      maxEmployees: 5,
      modules: [
        "dashboard",
        "appointments",
        "agenda",
        "doctors",
        "patients",
        "settings",
      ],
    },
    highlights: [
      "Ate 3 profissionais",
      "Ate 500 pacientes",
      "Agendamentos ilimitados",
      "Dashboard com metricas",
      "Suporte via e-mail",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "Para clinicas em crescimento com equipe completa",
    priceInCents: 14900,
    recommended: true,
    features: {
      maxDoctors: 15,
      maxPatients: 5000,
      maxEmployees: 20,
      modules: [
        "dashboard",
        "appointments",
        "agenda",
        "doctors",
        "patients",
        "medical_records",
        "documents",
        "financial",
        "crm",
        "whatsapp",
        "reports",
        "settings",
      ],
    },
    highlights: [
      "Ate 15 profissionais",
      "Ate 5.000 pacientes",
      "Prontuario eletronico",
      "Financeiro completo",
      "WhatsApp integrado",
      "Relatorios avancados",
      "Suporte prioritario",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Para clinicas e redes com operacao completa",
    priceInCents: 29900,
    features: {
      maxDoctors: -1, // unlimited
      maxPatients: -1,
      maxEmployees: -1,
      modules: [...ALL_MODULES],
    },
    highlights: [
      "Profissionais ilimitados",
      "Pacientes ilimitados",
      "Todos os modulos",
      "Secretar.IA com inteligencia artificial",
      "Campanhas de marketing",
      "Trafego pago",
      "Estoque e RH",
      "LGPD e compliance",
      "Suporte dedicado 24/7",
    ],
  },
];

export const getPlanById = (planId: string | null | undefined): Plan => {
  return PLANS.find((p) => p.id === planId) ?? PLANS[0];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const canAccessModule = (planId: string | null | undefined, moduleId: ModuleId): boolean => {
  return true;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const canAccessRoute = (planId: string | null | undefined, pathname: string): boolean => {
  return true;
};

export const formatPlanPrice = (priceInCents: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(priceInCents / 100);
};
