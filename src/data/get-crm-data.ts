import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  campaignsTable,
  satisfactionSurveysTable,
} from "@/db/schema";

interface GetCampaignsParams {
  clinicId: string;
}

export const getCampaigns = async ({ clinicId }: GetCampaignsParams) => {
  return db.query.campaignsTable.findMany({
    where: eq(campaignsTable.clinicId, clinicId),
    with: {
      recipients: true,
    },
    orderBy: [desc(campaignsTable.createdAt)],
  });
};

interface GetCampaignParams {
  clinicId: string;
  campaignId: string;
}

export const getCampaign = async ({
  clinicId,
  campaignId,
}: GetCampaignParams) => {
  return db.query.campaignsTable.findFirst({
    where: and(
      eq(campaignsTable.id, campaignId),
      eq(campaignsTable.clinicId, clinicId),
    ),
    with: {
      recipients: {
        with: {
          patient: true,
        },
      },
    },
  });
};

interface GetSatisfactionSurveysParams {
  clinicId: string;
}

export const getSatisfactionSurveys = async ({
  clinicId,
}: GetSatisfactionSurveysParams) => {
  return db.query.satisfactionSurveysTable.findMany({
    where: eq(satisfactionSurveysTable.clinicId, clinicId),
    with: {
      patient: true,
    },
    orderBy: [desc(satisfactionSurveysTable.createdAt)],
  });
};

interface GetNpsStatsParams {
  clinicId: string;
}

export const getNpsStats = async ({ clinicId }: GetNpsStatsParams) => {
  const surveys = await db
    .select({
      score: satisfactionSurveysTable.score,
    })
    .from(satisfactionSurveysTable)
    .where(eq(satisfactionSurveysTable.clinicId, clinicId));

  const totalResponses = surveys.length;

  if (totalResponses === 0) {
    return {
      npsScore: 0,
      averageScore: 0,
      totalResponses: 0,
    };
  }

  let promoters = 0;
  let detractors = 0;
  let totalScore = 0;

  for (const survey of surveys) {
    totalScore += survey.score;
    if (survey.score >= 9) {
      promoters++;
    } else if (survey.score <= 6) {
      detractors++;
    }
  }

  const npsScore = Math.round(
    ((promoters - detractors) / totalResponses) * 100,
  );
  const averageScore = Number((totalScore / totalResponses).toFixed(1));

  return {
    npsScore,
    averageScore,
    totalResponses,
  };
};
