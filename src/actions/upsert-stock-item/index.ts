"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { stockItemsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertStockItemSchema } from "./schema";

export const upsertStockItem = protectedWithClinicActionClient
  .schema(upsertStockItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { expirationDate, ...rest } = parsedInput;

    const values = {
      ...rest,
      clinicId: ctx.user.clinic.id,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
    };

    await db
      .insert(stockItemsTable)
      .values(values)
      .onConflictDoUpdate({
        target: [stockItemsTable.id],
        set: values,
      });
    revalidatePath("/estoque");
  });
