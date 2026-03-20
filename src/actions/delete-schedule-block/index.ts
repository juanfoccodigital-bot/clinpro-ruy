"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { doctorScheduleBlocksTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteScheduleBlock = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const block = await db.query.doctorScheduleBlocksTable.findFirst({
      where: eq(doctorScheduleBlocksTable.id, parsedInput.id),
    });
    if (!block) {
      throw new Error("Bloqueio não encontrado");
    }
    if (block.clinicId !== ctx.user.clinic.id) {
      throw new Error("Bloqueio não encontrado");
    }
    await db
      .delete(doctorScheduleBlocksTable)
      .where(eq(doctorScheduleBlocksTable.id, parsedInput.id));
    revalidatePath("/agenda");
  });
