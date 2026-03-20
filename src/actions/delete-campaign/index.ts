"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { campaignsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteCampaign = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const campaign = await db.query.campaignsTable.findFirst({
      where: eq(campaignsTable.id, parsedInput.id),
    });
    if (!campaign) {
      throw new Error("Campanha não encontrada");
    }
    if (campaign.clinicId !== ctx.user.clinic.id) {
      throw new Error("Campanha não encontrada");
    }
    await db
      .delete(campaignsTable)
      .where(eq(campaignsTable.id, parsedInput.id));
    revalidatePath("/crm");
  });
