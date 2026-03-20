import {
  CalendarDays,
  ClipboardList,
  DollarSign,
  FileText,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPortalSession } from "@/lib/portal-auth";

const navigationCards = [
  {
    title: "Agendamentos",
    description: "Veja seus proximos agendamentos e historico.",
    href: "/portal/agendamentos",
    icon: CalendarDays,
  },
  {
    title: "Documentos",
    description: "Acesse receitas, atestados e laudos.",
    href: "/portal/documentos",
    icon: FileText,
  },
  {
    title: "Historico Clinico",
    description: "Consulte seus registros clinicos.",
    href: "/portal/historico",
    icon: ClipboardList,
  },
  {
    title: "Financeiro",
    description: "Acompanhe seus pagamentos e faturas.",
    href: "/portal/financeiro",
    icon: DollarSign,
  },
];

export default async function PortalPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ola, {session.patient.name}!</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao Portal do Paciente.
          </p>
        </div>
        <form action="/api/portal/logout" method="POST">
          <Button variant="outline" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </form>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {navigationCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
