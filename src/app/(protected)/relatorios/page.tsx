import {
  BarChart3,
  CalendarIcon,
  DollarSignIcon,
  LayoutDashboardIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageBanner,
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";
import WithAuthentication from "@/hocs/with-authentication";

const reportCards = [
  {
    title: "Ocupacao",
    description:
      "Acompanhe a taxa de ocupacao e o aproveitamento dos horarios da clinica.",
    href: "/relatorios/ocupacao",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Pacientes",
    description:
      "Visualize estatisticas sobre seus pacientes, novos cadastros e os mais frequentes.",
    href: "/relatorios/pacientes",
    icon: UsersIcon,
  },
  {
    title: "Financeiro",
    description:
      "Analise receitas, despesas e lucro liquido com detalhamento por categoria e forma de pagamento.",
    href: "/relatorios/financeiro",
    icon: DollarSignIcon,
  },
  {
    title: "Procedimentos",
    description:
      "Veja o volume de procedimentos por status e a media diaria.",
    href: "/relatorios/agendamentos",
    icon: CalendarIcon,
  },
];

const RelatoriosPage = async () => {
  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageBanner
          icon={BarChart3}
          title="Relatorios"
          description="Visualize os relatorios da sua clinica"
        />
        <PageContent>
          <div className="animate-fade-slide-up delay-1">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {reportCards.map((card) => (
                <Link key={card.href} href={card.href}>
                  <Card className="cursor-pointer transition-shadow hover:shadow-md">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <card.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle>{card.title}</CardTitle>
                        <CardDescription>{card.description}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default RelatoriosPage;
