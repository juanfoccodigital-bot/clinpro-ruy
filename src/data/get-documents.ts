import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { documentsTable,documentTemplatesTable } from "@/db/schema";

interface GetDocumentsParams {
  clinicId: string;
}

export const getDocuments = async ({ clinicId }: GetDocumentsParams) => {
  const [documents, templates] = await Promise.all([
    db.query.documentsTable.findMany({
      where: eq(documentsTable.clinicId, clinicId),
      with: {
        patient: true,
        doctor: true,
      },
      orderBy: [desc(documentsTable.createdAt)],
      limit: 100,
    }),
    db.query.documentTemplatesTable.findMany({
      where: eq(documentTemplatesTable.clinicId, clinicId),
      orderBy: [desc(documentTemplatesTable.createdAt)],
    }),
  ]);

  return {
    documents,
    templates,
  };
};
