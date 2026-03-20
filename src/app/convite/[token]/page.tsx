import { and, eq } from "drizzle-orm";
import { CheckCircle2, XCircle } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { acceptInvitation } from "@/actions/accept-invitation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { clinicInvitationsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

interface ConvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function ConvitePage({ params }: ConvitePageProps) {
  const { token } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(`/authentication?redirect=/convite/${token}`);
  }

  const invitation = await db.query.clinicInvitationsTable.findFirst({
    where: and(
      eq(clinicInvitationsTable.token, token),
    ),
    with: {
      clinic: true,
      invitedBy: true,
    },
  });

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="mt-4">Convite Invalido</CardTitle>
            <CardDescription>
              Este convite nao foi encontrado ou ja foi utilizado.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/dashboard">Ir para o Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.status !== "pending" || new Date() > invitation.expiresAt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="mt-4">Convite Expirado</CardTitle>
            <CardDescription>
              Este convite expirou ou ja foi utilizado. Solicite um novo convite ao administrador da clinica.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/dashboard">Ir para o Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    member: "Membro",
    viewer: "Visualizador",
  };

  const handleAccept = async () => {
    "use server";
    await acceptInvitation(token);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4">Convite para Clinica</CardTitle>
          <CardDescription>
            Voce foi convidado para participar da clinica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border bg-muted/50 p-4 text-center">
            <p className="text-lg font-semibold">{invitation.clinic.name}</p>
            <p className="text-sm text-muted-foreground">
              Funcao: {roleLabels[invitation.role] ?? invitation.role}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Convidado por {invitation.invitedBy.name}
            </p>
          </div>

          <form action={handleAccept}>
            <Button type="submit" className="w-full" size="lg">
              Aceitar Convite
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
