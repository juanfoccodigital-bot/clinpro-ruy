"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { satisfactionSurveysTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteSatisfactionSurvey = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const survey = await db.query.satisfactionSurveysTable.findFirst({
      where: eq(satisfactionSurveysTable.id, parsedInput.id),
    });
    if (!survey) {
      throw new Error("Pesquisa de satisfação não encontrada");
    }
    if (survey.clinicId !== ctx.user.clinic.id) {
      throw new Error("Pesquisa de satisfação não encontrada");
    }
    await db
      .delete(satisfactionSurveysTable)
      .where(eq(satisfactionSurveysTable.id, parsedInput.id));
    revalidatePath("/crm");
  });
