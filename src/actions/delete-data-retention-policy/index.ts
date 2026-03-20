"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { dataRetentionPoliciesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteDataRetentionPolicy = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const policy = await db.query.dataRetentionPoliciesTable.findFirst({
      where: eq(dataRetentionPoliciesTable.id, parsedInput.id),
    });
    if (!policy) {
      throw new Error("Política de retenção de dados não encontrada");
    }
    if (policy.clinicId !== ctx.user.clinic.id) {
      throw new Error("Política de retenção de dados não encontrada");
    }
    await db
      .delete(dataRetentionPoliciesTable)
      .where(eq(dataRetentionPoliciesTable.id, parsedInput.id));
    revalidatePath("/configuracoes/lgpd");
  });
