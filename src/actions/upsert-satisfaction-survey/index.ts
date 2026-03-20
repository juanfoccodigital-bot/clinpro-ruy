"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { satisfactionSurveysTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertSatisfactionSurveySchema } from "./schema";

export const upsertSatisfactionSurvey = protectedWithClinicActionClient
  .schema(upsertSatisfactionSurveySchema)
  .action(async ({ parsedInput, ctx }) => {
    const values = {
      ...parsedInput,
      clinicId: ctx.user.clinic.id,
      token: parsedInput.id ? undefined : crypto.randomUUID(),
    };

    await db
      .insert(satisfactionSurveysTable)
      .values(values as typeof satisfactionSurveysTable.$inferInsert)
      .onConflictDoUpdate({
        target: [satisfactionSurveysTable.id],
        set: {
          patientId: parsedInput.patientId,
          appointmentId: parsedInput.appointmentId,
          score: parsedInput.score,
          comment: parsedInput.comment,
        },
      });
    revalidatePath("/crm");
  });
