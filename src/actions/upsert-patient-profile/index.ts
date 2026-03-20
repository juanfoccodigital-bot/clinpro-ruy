"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { patientProfilesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertPatientProfileSchema } from "./schema";

export const upsertPatientProfile = protectedWithClinicActionClient
  .schema(upsertPatientProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { dateOfBirth, ...rest } = parsedInput;

    await db
      .insert(patientProfilesTable)
      .values({
        ...rest,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        clinicId: ctx.user.clinic.id,
      })
      .onConflictDoUpdate({
        target: [patientProfilesTable.patientId],
        set: {
          ...rest,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        },
      });
    revalidatePath("/patients");
  });
