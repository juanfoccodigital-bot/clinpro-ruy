"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { stockItemsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteStockItem = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const stockItem = await db.query.stockItemsTable.findFirst({
      where: eq(stockItemsTable.id, parsedInput.id),
    });
    if (!stockItem) {
      throw new Error("Item de estoque não encontrado");
    }
    if (stockItem.clinicId !== ctx.user.clinic.id) {
      throw new Error("Item de estoque não encontrado");
    }
    await db
      .delete(stockItemsTable)
      .where(eq(stockItemsTable.id, parsedInput.id));
    revalidatePath("/estoque");
  });
