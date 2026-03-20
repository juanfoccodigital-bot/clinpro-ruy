"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { financialTransactionsTable } from "@/db/schema";
import { getRequestInfo, logAuditEvent } from "@/lib/audit-logger";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertTransactionSchema } from "./schema";

export const upsertTransaction = protectedWithClinicActionClient
  .schema(upsertTransactionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { dueDate, paymentDate, ...rest } = parsedInput;

    const values = {
      ...rest,
      clinicId: ctx.user.clinic.id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      paymentDate: paymentDate ? new Date(paymentDate) : undefined,
    };

    await db
      .insert(financialTransactionsTable)
      .values(values)
      .onConflictDoUpdate({
        target: [financialTransactionsTable.id],
        set: values,
      });
    const isUpdate = !!parsedInput.id;
    const { ipAddress, userAgent } = await getRequestInfo();
    await logAuditEvent({
      clinicId: ctx.user.clinic.id,
      userId: ctx.user.id,
      action: isUpdate ? "update" : "create",
      module: "financial",
      resourceId: parsedInput.id,
      resourceType: "transaction",
      description: isUpdate
        ? "Transacao atualizada"
        : "Transacao criada",
      ipAddress,
      userAgent,
    });
    revalidatePath("/financeiro");
  });
