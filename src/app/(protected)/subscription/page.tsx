import { AlertTriangle,CalendarDays, CheckCircle2, Clock, CreditCard } from "lucide-react";
import { headers } from "next/headers";

import {
  PageBanner,
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

const SubscriptionPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicName = session?.user?.clinic?.name ?? "Sua Clínica";

  // TODO: Connect with Hubla API to get real payment data
  const paymentData = {
    status: "active" as "active" | "pending" | "overdue",
    monthlyAmount: "R$ 297,00",
    nextDueDate: "11/04/2026",
    lastPaymentDate: "11/03/2026",
    paymentMethod: "Hubla",
  };

  const statusConfig = {
    active: {
      label: "Em dia",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
      iconColor: "text-emerald-500",
    },
    pending: {
      label: "Aguardando pagamento",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      iconColor: "text-amber-500",
    },
    overdue: {
      label: "Pagamento atrasado",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
      iconColor: "text-red-500",
    },
  };

  const status = statusConfig[paymentData.status];
  const StatusIcon = status.icon;

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageBanner
          icon={CreditCard}
          title="Pagamento"
          description="Gerencie o pagamento mensal da sua clínica"
        />
        <PageContent>
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Status Card */}
            <div className={`flex items-center gap-4 rounded-xl border p-5 ${status.bg}`}>
              <StatusIcon className={`h-8 w-8 ${status.iconColor}`} />
              <div>
                <p className={`text-lg font-semibold ${status.color}`}>{status.label}</p>
                <p className="text-sm text-muted-foreground">{clinicName}</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="rounded-xl border bg-card p-6 space-y-5">
              <h3 className="text-lg font-semibold">Detalhes do Pagamento</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Mensal</p>
                    <p className="text-xl font-bold">{paymentData.monthlyAmount}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <CalendarDays className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Próximo Vencimento</p>
                    <p className="text-xl font-bold">{paymentData.nextDueDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Último Pagamento</p>
                    <p className="font-semibold">{paymentData.lastPaymentDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Meio de Pagamento</p>
                    <p className="font-semibold">{paymentData.paymentMethod}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-medium">Sobre o pagamento</p>
              <p className="mt-1 text-amber-700">
                O pagamento é processado via Hubla. Em caso de dúvidas sobre cobrança,
                entre em contato com o suporte.
              </p>
            </div>
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default SubscriptionPage;
