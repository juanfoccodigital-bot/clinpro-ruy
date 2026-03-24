import { headers } from "next/headers";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getQuickReplies,
  getWhatsappConnections,
} from "@/data/get-whatsapp-data";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import ConnectionsView from "./_components/connections-view";
import QuickRepliesView from "./_components/quick-replies-view";
import SignatureSettings from "./_components/signature-settings";

const WhatsAppConfiguracoesPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const clinicId = session!.user.clinic!.id;

  const [connections, quickReplies] = await Promise.all([
    getWhatsappConnections({ clinicId }),
    getQuickReplies({ clinicId }),
  ]);

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Configuracoes do WhatsApp</PageTitle>
            <PageDescription>
              Gerencie conexoes com a Evolution API e respostas rapidas.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <Tabs defaultValue="connections">
            <TabsList>
              <TabsTrigger value="connections">Conexoes</TabsTrigger>
              <TabsTrigger value="quick-replies">Respostas Rapidas</TabsTrigger>
              <TabsTrigger value="signature">Assinatura</TabsTrigger>
            </TabsList>
            <TabsContent value="connections">
              <ConnectionsView data={connections} />
            </TabsContent>
            <TabsContent value="quick-replies">
              <QuickRepliesView data={quickReplies} />
            </TabsContent>
            <TabsContent value="signature">
              {connections.length > 0 ? (
                <SignatureSettings
                  connectionId={connections[0].id}
                  initialText={(connections[0] as Record<string, unknown>).signatureText as string | null}
                  initialEnabled={(connections[0] as Record<string, unknown>).signatureEnabled as boolean ?? true}
                />
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Conecte uma instancia WhatsApp primeiro.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default WhatsAppConfiguracoesPage;
