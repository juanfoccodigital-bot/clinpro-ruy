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
  getAuditLogs,
  getConsentTerms,
  getDataRetentionPolicies,
} from "@/data/get-lgpd-data";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AuditLogsView from "./_components/audit-logs-view";
import ConsentTermsView from "./_components/consent-terms-view";
import RetentionPoliciesView from "./_components/retention-policies-view";

const LgpdPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const clinicId = session!.user.clinic!.id;

  const [auditLogs, consentTerms, retentionPolicies] = await Promise.all([
    getAuditLogs({ clinicId }),
    getConsentTerms({ clinicId }),
    getDataRetentionPolicies({ clinicId }),
  ]);

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>LGPD e Seguranca</PageTitle>
            <PageDescription>
              Gerencie logs de auditoria, termos de consentimento e politicas de
              retencao de dados.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <Tabs defaultValue="audit">
            <TabsList>
              <TabsTrigger value="audit">Logs de Auditoria</TabsTrigger>
              <TabsTrigger value="consent">
                Termos de Consentimento
              </TabsTrigger>
              <TabsTrigger value="retention">
                Politicas de Retencao
              </TabsTrigger>
            </TabsList>
            <TabsContent value="audit">
              <AuditLogsView data={auditLogs} />
            </TabsContent>
            <TabsContent value="consent">
              <ConsentTermsView data={consentTerms} />
            </TabsContent>
            <TabsContent value="retention">
              <RetentionPoliciesView data={retentionPolicies} />
            </TabsContent>
          </Tabs>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default LgpdPage;
