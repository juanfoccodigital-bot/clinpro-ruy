"use client";

import {
  Contact,
  MessageCircle,
  UserPlus,
  UsersRound,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CrmSummaryCardsProps {
  totalContacts: number;
  whatsappContacts: number;
  manualContacts: number;
  recentContacts: number;
}

const CrmSummaryCards = ({
  totalContacts,
  whatsappContacts,
  manualContacts,
  recentContacts,
}: CrmSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Contatos
          </CardTitle>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
            <UsersRound className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalContacts}</div>
          <p className="text-xs text-muted-foreground">
            Contatos cadastrados
          </p>
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Via WhatsApp
          </CardTitle>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
            <MessageCircle className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-600">
            {whatsappContacts}
          </div>
          <p className="text-xs text-muted-foreground">
            Contatos via WhatsApp
          </p>
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Cadastro Manual
          </CardTitle>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
            <Contact className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-600">
            {manualContacts}
          </div>
          <p className="text-xs text-muted-foreground">
            Adicionados manualmente
          </p>
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Novos (30 dias)
          </CardTitle>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
            <UserPlus className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-600">
            {recentContacts}
          </div>
          <p className="text-xs text-muted-foreground">
            Nos ultimos 30 dias
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrmSummaryCards;
