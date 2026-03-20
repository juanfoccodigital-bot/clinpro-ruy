"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { campaignRecipientsTable, campaignsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const sendCampaign = protectedWithClinicActionClient
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

    const now = new Date();

    await db.transaction(async (tx) => {
      await tx
        .update(campaignsTable)
        .set({
          status: "sent",
          sentAt: now,
        })
        .where(eq(campaignsTable.id, parsedInput.id));

      await tx
        .update(campaignRecipientsTable)
        .set({
          status: "sent",
          sentAt: now,
        })
        .where(
          and(
            eq(campaignRecipientsTable.campaignId, parsedInput.id),
            eq(campaignRecipientsTable.status, "pending"),
          ),
        );
    });

    revalidatePath("/crm");
  });
