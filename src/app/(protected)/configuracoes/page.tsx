import { eq } from "drizzle-orm";
import { Settings } from "lucide-react";
import { headers } from "next/headers";

import {
  PageBanner,
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/db";
import {
  clinicInvitationsTable,
  clinicsTable,
  usersToClinicsTable,
} from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import ClinicSettingsForm from "./_components/clinic-settings-form";
import MembersManagement from "./_components/members-management";
import PlanOverview from "./_components/plan-overview";
import ProfileSettings from "./_components/profile-settings";
import TwoFactorSettings from "./_components/two-factor-settings";

const ConfiguracoesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const [clinic, members, invitations] = await Promise.all([
    db.query.clinicsTable.findFirst({
      where: eq(clinicsTable.id, clinicId),
    }),
    db.query.usersToClinicsTable.findMany({
      where: eq(usersToClinicsTable.clinicId, clinicId),
      with: {
        user: true,
      },
    }),
    db.query.clinicInvitationsTable.findMany({
      where: eq(clinicInvitationsTable.clinicId, clinicId),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    }),
  ]);

  if (!clinic) return null;

  const pendingInvitations = invitations.filter((i) => i.status === "pending");

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageBanner
          icon={Settings}
          title="Configuracoes"
          description="Gerencie as configuracoes da sua clinica, equipe e plano"
        />
        <PageContent>
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="clinic">Clinica</TabsTrigger>
              <TabsTrigger value="members">Equipe</TabsTrigger>
              <TabsTrigger value="security">Seguranca</TabsTrigger>
              <TabsTrigger value="plan">Plano</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileSettings
                user={{
                  id: session!.user.id,
                  name: session!.user.name,
                  email: session!.user.email,
                  image: session!.user.image || null,
                }}
              />
            </TabsContent>

            <TabsContent value="clinic">
              <ClinicSettingsForm
                clinic={{
                  id: clinic.id,
                  name: clinic.name,
                  logoUrl: clinic.logoUrl,
                }}
              />
            </TabsContent>

            <TabsContent value="members">
              <MembersManagement
                members={members.map((m) => ({
                  userId: m.userId,
                  role: m.role,
                  user: {
                    id: m.user.id,
                    name: m.user.name,
                    email: m.user.email,
                  },
                }))}
                invitations={pendingInvitations.map((i) => ({
                  id: i.id,
                  email: i.email,
                  role: i.role,
                  status: i.status,
                  createdAt: i.createdAt,
                  expiresAt: i.expiresAt,
                }))}
                currentUserId={session!.user.id}
                userRole={session!.user.role}
              />
            </TabsContent>

            <TabsContent value="security">
              <TwoFactorSettings
                twoFactorEnabled={
                  (session!.user as Record<string, unknown>)
                    .twoFactorEnabled === true
                }
              />
            </TabsContent>

            <TabsContent value="plan">
              <PlanOverview currentPlan={clinic.plan ?? "starter"} />
            </TabsContent>
          </Tabs>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default ConfiguracoesPage;
