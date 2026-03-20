import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { satisfactionSurveysTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import NpsScoreCard from "./_components/nps-score-card";
import SurveyDataTable from "./_components/survey-data-table";

const NpsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const surveys = await db.query.satisfactionSurveysTable.findMany({
    where: eq(satisfactionSurveysTable.clinicId, clinicId),
    with: {
      patient: true,
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

  const respondedSurveys = surveys.filter((s) => s.respondedAt !== null);
  const promoters = respondedSurveys.filter((s) => s.score >= 9).length;
  const passives = respondedSurveys.filter(
    (s) => s.score >= 7 && s.score <= 8,
  ).length;
  const detractors = respondedSurveys.filter((s) => s.score <= 6).length;
  const totalResponses = respondedSurveys.length;

  const npsScore =
    totalResponses > 0
      ? Math.round(((promoters - detractors) / totalResponses) * 100)
      : 0;

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>NPS - Satisfacao do Paciente</PageTitle>
            <PageDescription>
              Acompanhe o Net Promoter Score e as avaliacoes dos pacientes da
              sua clinica.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <NpsScoreCard
            npsScore={npsScore}
            promoters={promoters}
            passives={passives}
            detractors={detractors}
            totalResponses={totalResponses}
          />
          <SurveyDataTable data={surveys} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default NpsPage;
