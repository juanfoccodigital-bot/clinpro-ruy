"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { employeesTable, timeTrackingTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertTimeRecordSchema } from "./schema";

export const upsertTimeRecord = protectedWithClinicActionClient
  .schema(upsertTimeRecordSchema)
  .action(async ({ parsedInput, ctx }) => {
    const employee = await db.query.employeesTable.findFirst({
      where: eq(employeesTable.id, parsedInput.employeeId),
    });
    if (!employee) {
      throw new Error("Funcionário não encontrado");
    }
    if (employee.clinicId !== ctx.user.clinic.id) {
      throw new Error("Funcionário não encontrado");
    }

    const { clockIn, clockOut, ...rest } = parsedInput;

    const values = {
      ...rest,
      clinicId: ctx.user.clinic.id,
      clockIn: new Date(clockIn),
      clockOut: clockOut ? new Date(clockOut) : undefined,
    };

    await db
      .insert(timeTrackingTable)
      .values(values)
      .onConflictDoUpdate({
        target: [timeTrackingTable.id],
        set: values,
      });
    revalidatePath("/funcionarios");
  });
