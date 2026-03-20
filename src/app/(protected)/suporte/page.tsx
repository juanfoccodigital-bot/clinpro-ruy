"use client";

import {
  BookOpen,
  ExternalLink,
  FileQuestion,
  Headphones,
  MessageCircle,
  Rocket,
} from "lucide-react";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageBanner,
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";

const WHATSAPP_NUMBER = "5511999999999";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Ola! Preciso de ajuda com o Clinpro.",
);

const faqItems = [
  {
    question: "Como conecto meu WhatsApp?",
    answer:
      "Acesse Atendimento > WhatsApp, clique em 'Conectar instancia' e escaneie o QR Code com seu celular. O WhatsApp ficara integrado ao sistema.",
  },
  {
    question: "Como funciona o agendamento online?",
    answer:
      "Os pacientes podem ser agendados pela aba Agenda de Procedimentos. Selecione a data, horario e paciente. O sistema valida automaticamente a disponibilidade.",
  },
  {
    question: "Como ativo a autenticacao de dois fatores (2FA)?",
    answer:
      "Va em Configuracoes > Seguranca e clique em 'Ativar 2FA'. Voce vai escanear um QR Code com um app como Google Authenticator e recebera codigos de backup.",
  },
  {
    question: "Posso personalizar o logo da clinica?",
    answer:
      "Sim! Em Configuracoes > Clinica, voce pode fazer upload do logo da sua clinica. Ele aparecera no sidebar e na area de navegacao.",
  },
  {
    question: "Como funciona o plano de assinatura?",
    answer:
      "Temos 3 planos: Starter (R$59/mes), Professional (R$149/mes) e Enterprise (R$299/mes). Cada plano libera modulos diferentes. Acesse Assinatura para ver detalhes e fazer upgrade.",
  },
  {
    question: "Como vejo os logs de auditoria (LGPD)?",
    answer:
      "Acesse Mais > LGPD para visualizar todos os logs de acoes realizadas no sistema, incluindo logins, criacoes e alteracoes de dados.",
  },
  {
    question: "O sistema e seguro para dados de pacientes?",
    answer:
      "Sim! Utilizamos criptografia, headers de seguranca (HSTS, CSP), rate limiting, auditoria completa de acoes e suporte a 2FA. Tudo em conformidade com a LGPD.",
  },
];

const tutorials = [
  {
    title: "Primeiros passos",
    description: "Configure sua clinica e faca seu primeiro agendamento.",
    duration: "5 min",
  },
  {
    title: "Gestao de pacientes",
    description: "Cadastre pacientes, crie fichas clinicas e gerencie documentos.",
    duration: "8 min",
  },
  {
    title: "WhatsApp integrado",
    description: "Conecte seu WhatsApp e gerencie conversas direto pelo sistema.",
    duration: "4 min",
  },
  {
    title: "Financeiro",
    description: "Controle receitas, despesas e tenha visao completa do fluxo de caixa.",
    duration: "6 min",
  },
  {
    title: "Seguranca e 2FA",
    description: "Ative autenticacao de dois fatores e entenda as camadas de protecao.",
    duration: "3 min",
  },
  {
    title: "Relatorios e metricas",
    description: "Entenda os graficos do dashboard e extraia relatorios do sistema.",
    duration: "5 min",
  },
];

const updates = [
  {
    version: "2.5.0",
    date: "Fev 2026",
    title: "Seguranca avancada",
    description:
      "Rate limiting, headers de seguranca (CSP/HSTS), audit logging completo e autenticacao de dois fatores (2FA/TOTP).",
    badge: "Novo",
  },
  {
    version: "2.4.0",
    date: "Fev 2026",
    title: "CRM e Contatos",
    description:
      "Nova pagina de contatos unificada com integracao WhatsApp, cards de resumo e tabela completa.",
    badge: "Novo",
  },
  {
    version: "2.3.0",
    date: "Jan 2026",
    title: "Sidebar reorganizado",
    description:
      "Nova estrutura de navegacao com agrupamentos intuitivos: Atendimento, CRM, Pacientes, Marketing e mais.",
    badge: null,
  },
  {
    version: "2.2.0",
    date: "Jan 2026",
    title: "WhatsApp com Evolution API",
    description:
      "Integracao completa com WhatsApp via Evolution API. Envie e receba mensagens direto pelo sistema.",
    badge: null,
  },
];

export default function SuportePage() {
  return (
    <PageContainer>
      <PageBanner
        icon={Headphones}
        title="Suporte"
        description="Tire suas duvidas, aprenda a usar o sistema e fique por dentro das novidades"
      />
      <PageContent>
        <div className="animate-fade-slide-up delay-1 space-y-8">
          {/* WhatsApp Contact */}
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-500" />
                Fale conosco pelo WhatsApp
              </CardTitle>
              <CardDescription>
                Nossa equipe esta pronta para ajudar voce. Atendimento de segunda a sexta, das 8h as 18h.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Abrir WhatsApp
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Tutorials */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <BookOpen className="h-5 w-5 text-primary" />
              Aulas sobre o sistema
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tutorials.map((tutorial) => (
                <Card
                  key={tutorial.title}
                  className="transition-shadow hover:shadow-md cursor-pointer"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {tutorial.title}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {tutorial.duration}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {tutorial.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <FileQuestion className="h-5 w-5 text-primary" />
              Perguntas frequentes (FAQ)
            </h2>
            <Card>
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left text-sm font-medium">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Updates */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Rocket className="h-5 w-5 text-primary" />
              Atualizacoes tecnicas
            </h2>
            <div className="space-y-3">
              {updates.map((update) => (
                <Card key={update.version}>
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <span className="text-xs font-bold text-primary">
                        {update.version}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{update.title}</h3>
                        {update.badge && (
                          <Badge variant="default" className="text-xs">
                            {update.badge}
                          </Badge>
                        )}
                        <span className="text-muted-foreground text-xs">
                          {update.date}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {update.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
}
