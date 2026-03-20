"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { stockItemsTable, stockMovementsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { addStockMovementSchema } from "./schema";

export const addStockMovement = protectedWithClinicActionClient
  .schema(addStockMovementSchema)
  .action(async ({ parsedInput, ctx }) => {
    const stockItem = await db.query.stockItemsTable.findFirst({
      where: eq(stockItemsTable.id, parsedInput.stockItemId),
    });
    if (!stockItem) {
      throw new Error("Item de estoque não encontrado");
    }
    if (stockItem.clinicId !== ctx.user.clinic.id) {
      throw new Error("Item de estoque não encontrado");
    }

    await db.transaction(async (tx) => {
      await tx.insert(stockMovementsTable).values({
        clinicId: ctx.user.clinic.id,
        stockItemId: parsedInput.stockItemId,
        type: parsedInput.type,
        quantity: parsedInput.quantity,
        batch: parsedInput.batch,
        notes: parsedInput.notes,
      });

      if (parsedInput.type === "entry") {
        await tx
          .update(stockItemsTable)
          .set({
            currentQuantity: sql`${stockItemsTable.currentQuantity} + ${parsedInput.quantity}`,
          })
          .where(eq(stockItemsTable.id, parsedInput.stockItemId));
      } else if (parsedInput.type === "exit") {
        await tx
          .update(stockItemsTable)
          .set({
            currentQuantity: sql`${stockItemsTable.currentQuantity} - ${parsedInput.quantity}`,
          })
          .where(eq(stockItemsTable.id, parsedInput.stockItemId));
      } else if (parsedInput.type === "adjustment") {
        await tx
          .update(stockItemsTable)
          .set({
            currentQuantity: parsedInput.quantity,
          })
          .where(eq(stockItemsTable.id, parsedInput.stockItemId));
      }
    });

    revalidatePath("/estoque");
  });
