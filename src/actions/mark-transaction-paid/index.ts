"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { financialTransactionsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { markTransactionPaidSchema } from "./schema";

export const markTransactionPaid = protectedWithClinicActionClient
  .schema(markTransactionPaidSchema)
  .action(async ({ parsedInput, ctx }) => {
    const transaction = await db.query.financialTransactionsTable.findFirst({
      where: eq(financialTransactionsTable.id, parsedInput.id),
    });
    if (!transaction) {
      throw new Error("Transação não encontrada");
    }
    if (transaction.clinicId !== ctx.user.clinic.id) {
      throw new Error("Transação não encontrada");
    }
    await db
      .update(financialTransactionsTable)
      .set({
        status: "paid",
        paymentDate: parsedInput.paymentDate
          ? new Date(parsedInput.paymentDate)
          : new Date(),
        ...(parsedInput.paymentMethod && {
          paymentMethod: parsedInput.paymentMethod,
        }),
      })
      .where(eq(financialTransactionsTable.id, parsedInput.id));
    revalidatePath("/financeiro");
  });
