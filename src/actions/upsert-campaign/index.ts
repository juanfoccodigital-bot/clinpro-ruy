"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { campaignsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertCampaignSchema } from "./schema";

export const upsertCampaign = protectedWithClinicActionClient
  .schema(upsertCampaignSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { scheduledFor, ...rest } = parsedInput;

    const values = {
      ...rest,
      clinicId: ctx.user.clinic.id,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
    };

    await db
      .insert(campaignsTable)
      .values(values)
      .onConflictDoUpdate({
        target: [campaignsTable.id],
        set: values,
      });
    revalidatePath("/crm");
  });
