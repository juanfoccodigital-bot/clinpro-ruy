"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { dataRetentionPoliciesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertDataRetentionPolicySchema } from "./schema";

export const upsertDataRetentionPolicy = protectedWithClinicActionClient
  .schema(upsertDataRetentionPolicySchema)
  .action(async ({ parsedInput, ctx }) => {
    const values = {
      ...parsedInput,
      clinicId: ctx.user.clinic.id,
    };

    await db
      .insert(dataRetentionPoliciesTable)
      .values(values)
      .onConflictDoUpdate({
        target: [dataRetentionPoliciesTable.id],
        set: {
          ...parsedInput,
          clinicId: ctx.user.clinic.id,
        },
      });
    revalidatePath("/configuracoes/lgpd");
  });
