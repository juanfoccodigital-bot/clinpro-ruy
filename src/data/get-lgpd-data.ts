import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  auditLogsTable,
  consentTermsTable,
  dataRetentionPoliciesTable,
} from "@/db/schema";

interface GetAuditLogsParams {
  clinicId: string;
}

export const getAuditLogs = async ({ clinicId }: GetAuditLogsParams) => {
  return db.query.auditLogsTable.findMany({
    where: eq(auditLogsTable.clinicId, clinicId),
    with: {
      user: true,
    },
    orderBy: [desc(auditLogsTable.createdAt)],
    limit: 500,
  });
};

interface GetConsentTermsParams {
  clinicId: string;
}

export const getConsentTerms = async ({
  clinicId,
}: GetConsentTermsParams) => {
  return db.query.consentTermsTable.findMany({
    where: eq(consentTermsTable.clinicId, clinicId),
    with: {
      patient: true,
    },
    orderBy: [desc(consentTermsTable.createdAt)],
  });
};

interface GetDataRetentionPoliciesParams {
  clinicId: string;
}

export const getDataRetentionPolicies = async ({
  clinicId,
}: GetDataRetentionPoliciesParams) => {
  return db.query.dataRetentionPoliciesTable.findMany({
    where: eq(dataRetentionPoliciesTable.clinicId, clinicId),
    orderBy: [asc(dataRetentionPoliciesTable.dataType)],
  });
};
