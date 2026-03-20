"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { timeTrackingTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteTimeRecord = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const timeRecord = await db.query.timeTrackingTable.findFirst({
      where: eq(timeTrackingTable.id, parsedInput.id),
    });
    if (!timeRecord) {
      throw new Error("Registro de ponto não encontrado");
    }
    if (timeRecord.clinicId !== ctx.user.clinic.id) {
      throw new Error("Registro de ponto não encontrado");
    }
    await db
      .delete(timeTrackingTable)
      .where(eq(timeTrackingTable.id, parsedInput.id));
    revalidatePath("/funcionarios");
  });
