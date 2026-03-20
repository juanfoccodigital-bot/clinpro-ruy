import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { stockItemsTable, stockMovementsTable } from "@/db/schema";

interface GetStockItemsParams {
  clinicId: string;
}

export const getStockItems = async ({ clinicId }: GetStockItemsParams) => {
  return db.query.stockItemsTable.findMany({
    where: eq(stockItemsTable.clinicId, clinicId),
    with: {
      movements: {
        orderBy: [desc(stockMovementsTable.createdAt)],
      },
    },
    orderBy: [stockItemsTable.name],
  });
};

interface GetStockItemParams {
  clinicId: string;
  itemId: string;
}

export const getStockItem = async ({
  clinicId,
  itemId,
}: GetStockItemParams) => {
  return db.query.stockItemsTable.findFirst({
    where: and(
      eq(stockItemsTable.id, itemId),
      eq(stockItemsTable.clinicId, clinicId),
    ),
    with: {
      movements: {
        orderBy: [desc(stockMovementsTable.createdAt)],
      },
    },
  });
};
