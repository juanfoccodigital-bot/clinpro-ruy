"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { employeesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteEmployee = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const employee = await db.query.employeesTable.findFirst({
      where: eq(employeesTable.id, parsedInput.id),
    });
    if (!employee) {
      throw new Error("Funcionário não encontrado");
    }
    if (employee.clinicId !== ctx.user.clinic.id) {
      throw new Error("Funcionário não encontrado");
    }
    await db
      .delete(employeesTable)
      .where(eq(employeesTable.id, parsedInput.id));
    revalidatePath("/funcionarios");
  });
