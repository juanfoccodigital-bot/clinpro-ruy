"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import {
  proceduresTable,
  procedureStockItemsTable,
  stockItemsTable,
  stockMovementsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

// ============================================================
// GET PROCEDURES
// ============================================================

export async function getProcedures() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.clinic?.id) {
    throw new Error("Unauthorized");
  }
  const procedures = await db.query.proceduresTable.findMany({
    where: eq(proceduresTable.clinicId, session.user.clinic.id),
    with: {
      stockItems: {
        with: {
          stockItem: true,
        },
      },
    },
    orderBy: (procedures, { asc }) => [asc(procedures.name)],
  });
  return procedures;
}

// ============================================================
// GET PROCEDURE BY ID
// ============================================================

export async function getProcedureById(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.clinic?.id) {
    throw new Error("Unauthorized");
  }
  const procedure = await db.query.proceduresTable.findFirst({
    where: and(
      eq(proceduresTable.id, id),
      eq(proceduresTable.clinicId, session.user.clinic.id),
    ),
    with: {
      stockItems: {
        with: {
          stockItem: true,
        },
      },
    },
  });
  return procedure;
}

// ============================================================
// CREATE PROCEDURE
// ============================================================

const createProcedureSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  defaultPriceInCents: z.number().min(0),
  durationMinutes: z.number().min(15),
  isActive: z.boolean().default(true),
  stockItems: z
    .array(
      z.object({
        stockItemId: z.string().uuid(),
        quantityUsed: z.number().min(0.01),
      }),
    )
    .optional(),
});

export const createProcedure = protectedWithClinicActionClient
  .schema(createProcedureSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { stockItems, ...procedureData } = parsedInput;

    await db.transaction(async (tx) => {
      const [procedure] = await tx
        .insert(proceduresTable)
        .values({
          ...procedureData,
          clinicId: ctx.user.clinic.id,
        })
        .returning();

      if (stockItems && stockItems.length > 0) {
        await tx.insert(procedureStockItemsTable).values(
          stockItems.map((item) => ({
            procedureId: procedure.id,
            stockItemId: item.stockItemId,
            quantityUsed: String(item.quantityUsed),
          })),
        );
      }
    });

    revalidatePath("/procedimentos");
  });

// ============================================================
// UPDATE PROCEDURE
// ============================================================

const updateProcedureSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  defaultPriceInCents: z.number().min(0),
  durationMinutes: z.number().min(15),
  isActive: z.boolean().default(true),
  stockItems: z
    .array(
      z.object({
        stockItemId: z.string().uuid(),
        quantityUsed: z.number().min(0.01),
      }),
    )
    .optional(),
});

export const updateProcedure = protectedWithClinicActionClient
  .schema(updateProcedureSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, stockItems, ...procedureData } = parsedInput;

    const existing = await db.query.proceduresTable.findFirst({
      where: eq(proceduresTable.id, id),
    });
    if (!existing || existing.clinicId !== ctx.user.clinic.id) {
      throw new Error("Procedimento não encontrado");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(proceduresTable)
        .set(procedureData)
        .where(eq(proceduresTable.id, id));

      // Delete existing stock items and re-insert
      await tx
        .delete(procedureStockItemsTable)
        .where(eq(procedureStockItemsTable.procedureId, id));

      if (stockItems && stockItems.length > 0) {
        await tx.insert(procedureStockItemsTable).values(
          stockItems.map((item) => ({
            procedureId: id,
            stockItemId: item.stockItemId,
            quantityUsed: String(item.quantityUsed),
          })),
        );
      }
    });

    revalidatePath("/procedimentos");
  });

// ============================================================
// DELETE PROCEDURE
// ============================================================

const deleteProcedureSchema = z.object({
  id: z.string().uuid(),
});

export const deleteProcedure = protectedWithClinicActionClient
  .schema(deleteProcedureSchema)
  .action(async ({ parsedInput, ctx }) => {
    const existing = await db.query.proceduresTable.findFirst({
      where: eq(proceduresTable.id, parsedInput.id),
    });
    if (!existing || existing.clinicId !== ctx.user.clinic.id) {
      throw new Error("Procedimento não encontrado");
    }

    await db
      .delete(proceduresTable)
      .where(eq(proceduresTable.id, parsedInput.id));

    revalidatePath("/procedimentos");
  });

// ============================================================
// DEDUCT PROCEDURE STOCK
// ============================================================

export async function deductProcedureStock(
  procedureId: string,
  clinicId: string,
) {
  const procedureItems = await db.query.procedureStockItemsTable.findMany({
    where: eq(procedureStockItemsTable.procedureId, procedureId),
    with: {
      stockItem: true,
    },
  });

  if (procedureItems.length === 0) return;

  await db.transaction(async (tx) => {
    for (const item of procedureItems) {
      const qty = Number(item.quantityUsed);

      // Create stock movement (exit)
      await tx.insert(stockMovementsTable).values({
        clinicId,
        stockItemId: item.stockItemId,
        type: "exit",
        quantity: Math.ceil(qty),
        notes: `Saída automática - Procedimento concluído`,
      });

      // Reduce stock item quantity
      await tx
        .update(stockItemsTable)
        .set({
          currentQuantity: sql`${stockItemsTable.currentQuantity} - ${Math.ceil(qty)}`,
        })
        .where(eq(stockItemsTable.id, item.stockItemId));
    }
  });
}
