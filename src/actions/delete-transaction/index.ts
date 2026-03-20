"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { financialTransactionsTable } from "@/db/schema";
import { getRequestInfo, logAuditEvent } from "@/lib/audit-logger";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteTransaction = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
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
      .delete(financialTransactionsTable)
      .where(eq(financialTransactionsTable.id, parsedInput.id));
    const { ipAddress, userAgent } = await getRequestInfo();
    await logAuditEvent({
      clinicId: ctx.user.clinic.id,
      userId: ctx.user.id,
      action: "delete",
      module: "financial",
      resourceId: parsedInput.id,
      resourceType: "transaction",
      description: "Transacao excluida",
      ipAddress,
      userAgent,
    });
    revalidatePath("/financeiro");
  });
