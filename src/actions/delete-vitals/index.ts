"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { vitalsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteVitals = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const vitals = await db.query.vitalsTable.findFirst({
      where: eq(vitalsTable.id, parsedInput.id),
    });
    if (!vitals) {
      throw new Error("Sinais vitais não encontrados");
    }
    if (vitals.clinicId !== ctx.user.clinic.id) {
      throw new Error("Sinais vitais não encontrados");
    }
    await db.delete(vitalsTable).where(eq(vitalsTable.id, parsedInput.id));
    revalidatePath("/patients");
  });
