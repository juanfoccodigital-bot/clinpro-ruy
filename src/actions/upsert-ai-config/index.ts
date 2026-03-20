"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { aiAgentConfigTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertAiConfigSchema } from "./schema";

export const upsertAiConfig = protectedWithClinicActionClient
  .schema(upsertAiConfigSchema)
  .action(async ({ parsedInput, ctx }) => {
    const values = {
      ...parsedInput,
      clinicId: ctx.user.clinic.id,
    };

    await db
      .insert(aiAgentConfigTable)
      .values(values)
      .onConflictDoUpdate({
        target: [aiAgentConfigTable.clinicId],
        set: parsedInput,
      });

    revalidatePath("/secretaria-ia");
  });
