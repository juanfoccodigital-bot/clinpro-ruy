"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { vitalsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertVitalsSchema } from "./schema";

export const upsertVitals = protectedWithClinicActionClient
  .schema(upsertVitalsSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .insert(vitalsTable)
      .values({
        ...parsedInput,
        clinicId: ctx.user.clinic.id,
        recordedBy: null,
      })
      .onConflictDoUpdate({
        target: [vitalsTable.id],
        set: {
          ...parsedInput,
          clinicId: ctx.user.clinic.id,
        },
      });
    revalidatePath("/patients");
  });
