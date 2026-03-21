"use server";

import { and,eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { paymentMachinesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

const createPaymentMachineSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório."),
  provider: z.string().trim().min(1, "Operadora é obrigatória."),
  debitFee: z.string().default("0"),
  creditFee: z.string().default("0"),
  credit2xFee: z.string().default("0"),
  credit3xFee: z.string().default("0"),
  credit4xFee: z.string().default("0"),
  credit5xFee: z.string().default("0"),
  credit6xFee: z.string().default("0"),
  credit7_12xFee: z.string().default("0"),
  pixFee: z.string().default("0"),
});

const updatePaymentMachineSchema = createPaymentMachineSchema.extend({
  id: z.string().uuid(),
  isActive: z.boolean().optional(),
});

const deletePaymentMachineSchema = z.object({
  id: z.string().uuid(),
});

export const getPaymentMachines = protectedWithClinicActionClient.action(
  async ({ ctx }) => {
    const machines = await db.query.paymentMachinesTable.findMany({
      where: eq(paymentMachinesTable.clinicId, ctx.user.clinic.id),
      orderBy: (table, { asc }) => [asc(table.name)],
    });
    return machines;
  },
);

export const createPaymentMachine = protectedWithClinicActionClient
  .schema(createPaymentMachineSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db.insert(paymentMachinesTable).values({
      ...parsedInput,
      clinicId: ctx.user.clinic.id,
    });
    revalidatePath("/financeiro/maquininhas");
  });

export const updatePaymentMachine = protectedWithClinicActionClient
  .schema(updatePaymentMachineSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...data } = parsedInput;
    await db
      .update(paymentMachinesTable)
      .set(data)
      .where(
        and(
          eq(paymentMachinesTable.id, id),
          eq(paymentMachinesTable.clinicId, ctx.user.clinic.id),
        ),
      );
    revalidatePath("/financeiro/maquininhas");
  });

export const deletePaymentMachine = protectedWithClinicActionClient
  .schema(deletePaymentMachineSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .delete(paymentMachinesTable)
      .where(
        and(
          eq(paymentMachinesTable.id, parsedInput.id),
          eq(paymentMachinesTable.clinicId, ctx.user.clinic.id),
        ),
      );
    revalidatePath("/financeiro/maquininhas");
  });
