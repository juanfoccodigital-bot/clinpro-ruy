"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { waitingListTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteWaitingListItem = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const item = await db.query.waitingListTable.findFirst({
      where: eq(waitingListTable.id, parsedInput.id),
    });
    if (!item) {
      throw new Error("Item da lista de espera não encontrado");
    }
    if (item.clinicId !== ctx.user.clinic.id) {
      throw new Error("Item da lista de espera não encontrado");
    }
    await db
      .delete(waitingListTable)
      .where(eq(waitingListTable.id, parsedInput.id));
    revalidatePath("/agenda");
  });
