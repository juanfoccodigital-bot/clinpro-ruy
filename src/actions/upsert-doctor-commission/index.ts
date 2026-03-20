"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { doctorCommissionsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertDoctorCommissionSchema } from "./schema";

export const upsertDoctorCommission = protectedWithClinicActionClient
  .schema(upsertDoctorCommissionSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .insert(doctorCommissionsTable)
      .values({
        ...parsedInput,
        clinicId: ctx.user.clinic.id,
      })
      .onConflictDoUpdate({
        target: [doctorCommissionsTable.id],
        set: {
          ...parsedInput,
          clinicId: ctx.user.clinic.id,
        },
      });
    revalidatePath("/financeiro");
  });
