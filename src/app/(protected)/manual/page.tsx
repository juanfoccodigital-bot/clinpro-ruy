import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  Contact,
  DollarSign,
  LayoutDashboard,
  MessageCircle,
  Package,
  Settings,
  Smartphone,
  TrendingUp,
  UserCog,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageBanner,
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";
import WithAuthentication from "@/hocs/with-authentication";

/* ------------------------------------------------------------------ */
/*  Inline helper components                                          */
/* ------------------------------------------------------------------ */

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D08C32] text-white text-xs font-bold">
        {number}
      </div>
      <div>
        <p className="text-sm font-medium text-[#261C10]">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-[#D08C32]/5 border border-[#D08C32]/10 p-3 flex gap-2">
      <span className="text-sm">💡</span>
      <p className="text-xs text-[#261C10]/70">{text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick‑link cards data                                             */
/* ------------------------------------------------------------------ */

const quickLinks = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Pacientes", href: "/patients", icon: UsersRound },
  { title: "Agendamentos", href: "/appointments", icon: CalendarDays },
  { title: "Agenda", href: "/agenda", icon: CalendarRange },
  { title: "CRM Funil", href: "/crm", icon: Contact },
  { title: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
  { title: "Financeiro", href: "/financeiro", icon: DollarSign },
  { title: "Estoque", href: "/estoque", icon: Package },
];

/* ------------------------------------------------------------------ */
/*  Manual sections data                                              */
/* ------------------------------------------------------------------ */

const sections = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    steps: [
      {
        title: "Visao geral do dia",
        description:
          "Ao acessar o Dashboard voce ve os indicadores do dia: agendamentos, faturamento, novos pacientes e taxa de comparecimento.",
      },
      {
        title: "Grafico de faturamento",
        description:
          "O grafico de barras mostra a evolucao do faturamento nos ultimos 30 dias. Use o seletor de periodo para alterar o intervalo.",
      },
      {
        title: "Proximos agendamentos",
        description:
          "A lista mostra os proximos atendimentos com nome, procedimento e horario. Clique em um para abrir os detalhes.",
      },
      {
        title: "Indicadores de conversao",
        description:
          "Os cards na parte inferior apresentam taxa de conversao de leads, ticket medio e volume de novos leads pelo CRM.",
      },
      {
        title: "Filtros de periodo",
        description:
          "Use os filtros de data no topo para comparar metricas entre semanas ou meses diferentes.",
      },
    ],
    tips: [
      "Acesse o Dashboard logo pela manha para ter uma visao rapida do dia e identificar horarios ociosos.",
      "Compare periodos diferentes para detectar tendencias de crescimento ou queda.",
    ],
  },
  {
    id: "pacientes",
    title: "Pacientes",
    icon: UsersRound,
    steps: [
      {
        title: "Cadastrar novo paciente",
        description:
          'Clique em "Novo Paciente" e preencha nome, telefone, CPF e e-mail. Os campos obrigatorios estao marcados com asterisco.',
      },
      {
        title: "Buscar pacientes",
        description:
          "Use a barra de busca para encontrar pacientes por nome, telefone ou CPF. A pesquisa e instantanea.",
      },
      {
        title: "Editar dados cadastrais",
        description:
          "Clique no nome do paciente para abrir a ficha. Na aba Dados Pessoais, edite as informacoes e salve.",
      },
      {
        title: "Ficha clinica",
        description:
          "Na aba Ficha Clinica do paciente voce pode registrar anamnese, evolucoes e anexar documentos como exames e fotos.",
      },
      {
        title: "Historico de atendimentos",
        description:
          "A aba Historico lista todos os agendamentos passados do paciente com status, procedimento e profissional.",
      },
      {
        title: "Historico financeiro",
        description:
          "Veja todos os pagamentos realizados pelo paciente, valores pendentes e formas de pagamento utilizadas.",
      },
    ],
    tips: [
      "Mantenha o telefone sempre atualizado — ele e usado para vincular conversas do WhatsApp automaticamente.",
      "Use tags para categorizar pacientes (ex: VIP, retorno, indicacao) e facilitar filtros no CRM.",
    ],
  },
  {
    id: "procedimentos",
    title: "Procedimentos",
    icon: ClipboardList,
    steps: [
      {
        title: "Criar procedimento",
        description:
          'Acesse Procedimentos e clique em "Novo". Defina nome, duracao, valor e categoria (ex: Estetica, Clinico).',
      },
      {
        title: "Vincular insumos do estoque",
        description:
          "Na edicao do procedimento, adicione os materiais consumidos. O sistema desconta automaticamente do estoque a cada atendimento.",
      },
      {
        title: "Definir profissionais habilitados",
        description:
          "Selecione quais profissionais podem realizar o procedimento. Apenas eles aparecerão na agenda para esse servico.",
      },
      {
        title: "Configurar valor e comissao",
        description:
          "Defina o preco padrao e a porcentagem de comissao do profissional. O financeiro calcula automaticamente.",
      },
      {
        title: "Ativar ou desativar",
        description:
          "Procedimentos desativados nao aparecem na tela de agendamento, mas o historico e mantido.",
      },
    ],
    tips: [
      "Vincule os insumos corretamente para que o estoque seja descontado de forma automatica a cada procedimento realizado.",
      "Revise os precos periodicamente e use o relatorio de procedimentos para identificar os mais rentaveis.",
    ],
  },
  {
    id: "agendamentos",
    title: "Agendamentos",
    icon: CalendarDays,
    steps: [
      {
        title: "Criar agendamento",
        description:
          'Clique em "Novo Agendamento", selecione paciente, procedimento, profissional, data e horario.',
      },
      {
        title: "Verificar disponibilidade",
        description:
          "O sistema exibe apenas horarios livres do profissional selecionado, evitando conflitos.",
      },
      {
        title: "Confirmar ou reagendar",
        description:
          "Altere o status para Confirmado, Reagendado ou Cancelado. O paciente pode ser notificado via WhatsApp.",
      },
      {
        title: "Registrar comparecimento",
        description:
          'Quando o paciente chegar, mude o status para "Em Atendimento" e depois para "Concluido" ao finalizar.',
      },
      {
        title: "Gerar cobranca",
        description:
          "Ao concluir o atendimento, o sistema permite gerar a transacao financeira vinculada ao procedimento.",
      },
      {
        title: "Cancelamento e no-show",
        description:
          'Marque como "Nao Compareceu" para alimentar os indicadores de taxa de comparecimento.',
      },
    ],
    tips: [
      "Use a integracao com WhatsApp para enviar lembretes automaticos de consulta e reduzir faltas.",
      "Acompanhe a taxa de comparecimento no Dashboard para identificar padroes de no-show.",
    ],
  },
  {
    id: "agenda",
    title: "Agenda",
    icon: CalendarRange,
    steps: [
      {
        title: "Visualizacao por dia, semana ou mes",
        description:
          "Alterne entre os modos de visualizacao no topo da agenda. O modo semanal e ideal para ver a ocupacao geral.",
      },
      {
        title: "Filtrar por profissional",
        description:
          "Selecione um ou mais profissionais para ver apenas os agendamentos deles. Util em clinicas com varios medicos.",
      },
      {
        title: "Arrastar e soltar (drag & drop)",
        description:
          "Arraste um agendamento para outro horario ou dia para reagendar rapidamente.",
      },
      {
        title: "Bloqueio de horarios",
        description:
          'Em Agenda > Bloqueios, cadastre periodos indisponiveis (ferias, almoco, manutencao). Eles ficam sinalizados na agenda.',
      },
      {
        title: "Lista de espera",
        description:
          "Cadastre pacientes na lista de espera. Quando um horario for liberado, o sistema sugere encaixar o proximo da fila.",
      },
      {
        title: "Cores por status",
        description:
          "Cada status de agendamento tem uma cor: azul (agendado), verde (confirmado), amarelo (em atendimento), cinza (concluido).",
      },
    ],
    tips: [
      "Use o bloqueio de horarios para intervalos fixos como almoco — isso evita agendamentos indesejados.",
      "A lista de espera ajuda a preencher cancelamentos de ultima hora e aumentar a taxa de ocupacao.",
    ],
  },
  {
    id: "crm",
    title: "CRM Funil de Vendas (MCE)",
    icon: Contact,
    steps: [
      {
        title: "Entender os 11 estagios do MCE",
        description:
          "O Metodo Comercial ELO possui 11 etapas: Novo Lead, Contato Inicial, Qualificacao, Agendamento de Avaliacao, Avaliacao Realizada, Proposta Enviada, Negociacao, Fechamento, Agendamento do Procedimento, Procedimento Realizado e Pos-venda.",
      },
      {
        title: "Mover cards entre etapas",
        description:
          "Arraste o card do paciente para a proxima etapa do funil ou use o botao de avancar. A movimentacao e instantanea (update otimista).",
      },
      {
        title: "Criar lead manualmente",
        description:
          'Clique em "Novo Lead" no topo do Kanban. Preencha nome, telefone e origem (indicacao, Instagram, Google, etc.).',
      },
      {
        title: "Leads automaticos via WhatsApp",
        description:
          "Quando um novo numero envia mensagem no WhatsApp, o sistema cria automaticamente um lead na etapa Novo Lead.",
      },
      {
        title: "Checklist de atividades",
        description:
          "Cada card possui um checklist com as acoes necessarias naquela etapa. Marque conforme concluir para acompanhar o progresso.",
      },
      {
        title: "Filtros e busca",
        description:
          "Filtre leads por origem, profissional responsavel ou periodo. Use a busca para encontrar um lead especifico.",
      },
      {
        title: "Ver mais cards",
        description:
          'Cada coluna mostra ate 15 cards. Clique em "Ver mais" no final da coluna para carregar os demais.',
      },
      {
        title: "Acompanhar metricas",
        description:
          "Acesse CRM > Performance para ver taxa de conversao entre etapas, tempo medio no funil e valor total do pipeline.",
      },
    ],
    tips: [
      "Configure a integracao com WhatsApp para criar leads automaticamente — nenhum contato sera perdido.",
      "Revise o funil diariamente para mover leads parados e manter o fluxo comercial ativo.",
    ],
  },
  {
    id: "crm-dashboard",
    title: "Dashboard Comercial",
    icon: BarChart3,
    steps: [
      {
        title: "Acessar o painel",
        description:
          "Navegue ate CRM > Performance para abrir o dashboard comercial com todos os indicadores de vendas.",
      },
      {
        title: "Taxa de conversao por etapa",
        description:
          "O grafico de funil mostra a porcentagem de leads que avancam de uma etapa para outra, identificando gargalos.",
      },
      {
        title: "Tempo medio no funil",
        description:
          "Veja quanto tempo em media um lead leva desde o primeiro contato ate o fechamento.",
      },
      {
        title: "Ranking de fontes de leads",
        description:
          "Descubra quais canais (Instagram, Google, indicacao) trazem mais leads e quais convertem melhor.",
      },
      {
        title: "Valor do pipeline",
        description:
          "O valor total de oportunidades ativas no funil, segmentado por etapa.",
      },
    ],
    tips: [
      "Use o dashboard para identificar em qual etapa os leads estao travando e ajustar sua abordagem comercial.",
    ],
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    icon: MessageCircle,
    steps: [
      {
        title: "Conectar o WhatsApp",
        description:
          "Acesse WhatsApp > Configuracoes e escaneie o QR Code com o celular para conectar sua conta.",
      },
      {
        title: "Visualizar conversas",
        description:
          "A tela principal lista todas as conversas com nome do contato, ultima mensagem e indicador de nao lidas.",
      },
      {
        title: "Responder mensagens",
        description:
          "Clique em uma conversa para abrir o chat. Digite e envie mensagens de texto, audio e imagens.",
      },
      {
        title: "Criacao automatica de leads",
        description:
          "Numeros novos que enviam mensagem criam automaticamente um lead no CRM na etapa Novo Lead.",
      },
      {
        title: "Secretar.IA",
        description:
          "O assistente de IA responde mensagens automaticamente com base nas regras configuradas, funcionando como uma secretaria virtual.",
      },
      {
        title: "Enviar mensagens em massa",
        description:
          "Use as campanhas de WhatsApp para enviar mensagens para listas de pacientes segmentadas.",
      },
    ],
    tips: [
      "Mantenha o WhatsApp sempre conectado para nao perder mensagens e garantir a criacao automatica de leads.",
      "Configure a Secretar.IA para responder fora do horario comercial e nao deixar pacientes sem retorno.",
    ],
  },
  {
    id: "financeiro",
    title: "Financeiro",
    icon: DollarSign,
    steps: [
      {
        title: "Visao geral financeira",
        description:
          "O painel mostra receitas, despesas e lucro liquido do periodo selecionado em cards resumidos.",
      },
      {
        title: "Registrar transacao",
        description:
          'Clique em "Nova Transacao" para registrar receitas ou despesas. Informe valor, categoria, forma de pagamento e data.',
      },
      {
        title: "Transacoes automaticas",
        description:
          "Agendamentos concluidos geram transacoes automaticas vinculadas ao paciente e procedimento.",
      },
      {
        title: "Gerenciar maquininhas",
        description:
          "Em Financeiro > Maquininhas, cadastre suas maquinas de cartao com bandeira e taxa. O sistema calcula o valor liquido automaticamente.",
      },
      {
        title: "Calculo automatico de taxas",
        description:
          "Ao registrar um pagamento por cartao, selecione a maquininha e o sistema aplica a taxa cadastrada para calcular o valor liquido recebido.",
      },
      {
        title: "Comissoes de profissionais",
        description:
          "O sistema calcula as comissoes com base no percentual definido em cada procedimento e gera o relatorio mensal.",
      },
      {
        title: "Exportar dados",
        description:
          "Exporte transacoes em CSV para importar na contabilidade ou gerar relatorios personalizados.",
      },
    ],
    tips: [
      "Cadastre todas as maquininhas com as taxas corretas para ter o valor liquido real do faturamento.",
      "Revise as comissoes antes do fechamento mensal para evitar divergencias com os profissionais.",
    ],
  },
  {
    id: "estoque",
    title: "Estoque",
    icon: Package,
    steps: [
      {
        title: "Cadastrar item",
        description:
          'Clique em "Novo Item" e preencha nome, categoria, unidade de medida, quantidade minima e fornecedor.',
      },
      {
        title: "Registrar entrada",
        description:
          "Adicione entradas de estoque informando quantidade, valor unitario, nota fiscal e data de validade.",
      },
      {
        title: "Baixa automatica",
        description:
          "Quando um procedimento vinculado e concluido, os insumos sao descontados automaticamente do estoque.",
      },
      {
        title: "Alerta de estoque baixo",
        description:
          "Itens abaixo da quantidade minima aparecem destacados em vermelho na listagem.",
      },
      {
        title: "Historico de movimentacoes",
        description:
          "Clique em um item para ver todas as entradas e saidas com data, quantidade e motivo.",
      },
    ],
    tips: [
      "Vincule os insumos aos procedimentos para que a baixa seja automatica e o estoque fique sempre atualizado.",
      "Configure a quantidade minima para receber alertas antes que os produtos acabem.",
    ],
  },
  {
    id: "trafego",
    title: "Trafego Pago (Meta Ads)",
    icon: TrendingUp,
    steps: [
      {
        title: "Conectar conta do Meta Ads",
        description:
          "Em Marketing > Trafego, conecte sua conta do Facebook/Instagram Ads para importar dados das campanhas.",
      },
      {
        title: "Visualizar campanhas ativas",
        description:
          "Veja todas as campanhas com status, orcamento diario, impressoes, cliques e leads gerados.",
      },
      {
        title: "CPL Real (Custo por Lead Real)",
        description:
          "O sistema cruza os leads do Meta com os leads que realmente chegaram ao CRM, calculando o CPL Real — nao apenas o CPL do Meta.",
      },
      {
        title: "Comparar campanhas",
        description:
          "Compare o desempenho de diferentes campanhas lado a lado para identificar qual traz leads mais qualificados.",
      },
      {
        title: "ROI por campanha",
        description:
          "Acompanhe o retorno sobre investimento vinculando o faturamento gerado pelos leads de cada campanha.",
      },
    ],
    tips: [
      "O CPL Real e mais preciso que o CPL do Meta porque considera apenas os leads que efetivamente entraram no seu funil.",
      "Analise o ROI por campanha mensalmente para redistribuir o orcamento para as campanhas mais rentaveis.",
    ],
  },
  {
    id: "funcionarios",
    title: "Funcionarios",
    icon: UserCog,
    steps: [
      {
        title: "Cadastrar funcionario",
        description:
          'Clique em "Novo Funcionario" e preencha dados pessoais, cargo, especialidade e horario de trabalho.',
      },
      {
        title: "Definir permissoes de acesso",
        description:
          "Atribua o nivel de acesso: Administrador, Profissional ou Recepcionista. Cada perfil tem permissoes diferentes.",
      },
      {
        title: "Configurar horarios de atendimento",
        description:
          "Defina os dias e horarios em que o profissional atende. A agenda so mostra slots dentro desses periodos.",
      },
      {
        title: "Vincular procedimentos",
        description:
          "Associe quais procedimentos o profissional realiza. Ele so aparecera na agenda para esses servicos.",
      },
      {
        title: "Comissoes",
        description:
          "Defina a porcentagem de comissao padrao. Ela pode ser personalizada por procedimento.",
      },
    ],
    tips: [
      "Mantenha os horarios dos profissionais sempre atualizados para evitar agendamentos em horarios incorretos.",
    ],
  },
  {
    id: "relatorios",
    title: "Relatorios",
    icon: BarChart3,
    steps: [
      {
        title: "Relatorio de ocupacao",
        description:
          "Veja a taxa de ocupacao da clinica por dia, semana ou mes. Identifique horarios ociosos e dias mais movimentados.",
      },
      {
        title: "Relatorio de pacientes",
        description:
          "Analise novos cadastros, pacientes ativos, inativos e frequencia de retorno.",
      },
      {
        title: "Relatorio financeiro",
        description:
          "Receitas, despesas e lucro liquido detalhados por categoria, forma de pagamento e profissional.",
      },
      {
        title: "Relatorio de agendamentos",
        description:
          "Volume de procedimentos realizados, cancelados e taxa de comparecimento por periodo.",
      },
      {
        title: "Exportar em CSV",
        description:
          "Todos os relatorios podem ser exportados em CSV para analises externas ou envio a contabilidade.",
      },
    ],
    tips: [
      "Gere relatorios semanais para acompanhar a evolucao da clinica e tomar decisoes baseadas em dados.",
    ],
  },
  {
    id: "configuracoes",
    title: "Configuracoes",
    icon: Settings,
    steps: [
      {
        title: "Dados da clinica",
        description:
          "Atualize nome, endereco, telefone, logo e horario de funcionamento da clinica.",
      },
      {
        title: "Usuarios e permissoes",
        description:
          "Gerencie os usuarios que tem acesso ao sistema e seus niveis de permissao.",
      },
      {
        title: "Plano e assinatura",
        description:
          "Veja seu plano atual, recursos disponiveis e gerencie sua assinatura.",
      },
      {
        title: "LGPD e privacidade",
        description:
          "Configure termos de consentimento, politica de privacidade e gerencie solicitacoes de exclusao de dados.",
      },
      {
        title: "Notificacoes",
        description:
          "Defina quais notificacoes deseja receber: novos agendamentos, cancelamentos, leads no CRM, etc.",
      },
      {
        title: "Integracoes",
        description:
          "Gerencie conexoes com WhatsApp, Meta Ads e outras integracoes disponiveis.",
      },
    ],
    tips: [
      "Configure a LGPD desde o inicio para garantir conformidade com a lei de protecao de dados.",
      "Revise as permissoes periodicamente, especialmente ao contratar ou desligar funcionarios.",
    ],
  },
  {
    id: "mobile",
    title: "Acesso Mobile",
    icon: Smartphone,
    steps: [
      {
        title: "Acessar pelo celular",
        description:
          "O ClinPro e totalmente responsivo. Acesse pelo navegador do celular com o mesmo login.",
      },
      {
        title: "Menu lateral mobile",
        description:
          "No celular, toque no icone de menu (hamburguer) para abrir a navegacao lateral com todas as secoes.",
      },
      {
        title: "Agenda no celular",
        description:
          "A agenda se adapta ao formato vertical do celular, mostrando a visualizacao diaria como padrao.",
      },
      {
        title: "Notificacoes em tempo real",
        description:
          "Receba alertas de novos agendamentos, mensagens do WhatsApp e leads diretamente no navegador mobile.",
      },
    ],
    tips: [
      "Adicione o ClinPro a tela inicial do celular para acesso rapido como se fosse um aplicativo nativo.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

const ManualPage = async () => {
  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        {/* Banner */}
        <PageBanner
          icon={BookOpen}
          title="Manual do Sistema"
          description="Guia completo de todas as funcionalidades do ClinPro"
        />

        <PageContent>
          {/* ---- Quick links ---- */}
          <div className="animate-fade-slide-up delay-1">
            <h2 className="text-lg font-semibold text-[#261C10] mb-3">
              Acesso Rapido
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Card className="group cursor-pointer border-[#D08C32]/10 transition-all hover:shadow-md hover:border-[#D08C32]/30">
                    <CardHeader className="flex flex-row items-center gap-3 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D08C32]/10 transition-colors group-hover:bg-[#D08C32]/20">
                        <link.icon className="h-4.5 w-4.5 text-[#D08C32]" />
                      </div>
                      <CardTitle className="text-sm font-medium">
                        {link.title}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* ---- Accordion sections ---- */}
          <div className="animate-fade-slide-up delay-2">
            <h2 className="text-lg font-semibold text-[#261C10] mb-3">
              Guia Completo por Modulo
            </h2>

            <Accordion type="multiple" className="space-y-2">
              {sections.map((section) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="rounded-xl border border-[#D08C32]/10 bg-white px-4 data-[state=open]:shadow-sm overflow-hidden"
                >
                  <AccordionTrigger className="py-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D08C32]/10">
                        <section.icon className="h-4 w-4 text-[#D08C32]" />
                      </div>
                      <span className="text-sm font-semibold text-[#261C10]">
                        {section.title}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <div className="space-y-4 pl-11">
                      {/* Steps */}
                      <div className="space-y-3">
                        {section.steps.map((step, idx) => (
                          <Step
                            key={idx}
                            number={idx + 1}
                            title={step.title}
                            description={step.description}
                          />
                        ))}
                      </div>

                      {/* Tips */}
                      <div className="space-y-2 pt-1">
                        {section.tips.map((tip, idx) => (
                          <Tip key={idx} text={tip} />
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default ManualPage;
