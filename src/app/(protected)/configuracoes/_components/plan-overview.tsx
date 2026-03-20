"use client";

import { CalendarDays, CheckCircle2, CreditCard } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PlanOverview({ currentPlan }: { currentPlan: string }) {
  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            Pagamento Mensal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span className="text-sm">Sistema ativo — acesso completo a todos os módulos</span>
          </div>
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span className="text-sm">Pagamento processado via Hubla</span>
          </div>
          <Button variant="outline" asChild className="mt-2">
            <Link href="/subscription">Ver detalhes do pagamento</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
