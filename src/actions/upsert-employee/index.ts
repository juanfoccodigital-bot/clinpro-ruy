"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { employeesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertEmployeeSchema } from "./schema";

export const upsertEmployee = protectedWithClinicActionClient
  .schema(upsertEmployeeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { hireDate, ...rest } = parsedInput;

    const values = {
      ...rest,
      clinicId: ctx.user.clinic.id,
      hireDate: hireDate ? new Date(hireDate) : undefined,
    };

    await db
      .insert(employeesTable)
      .values(values)
      .onConflictDoUpdate({
        target: [employeesTable.id],
        set: values,
      });
    revalidatePath("/funcionarios");
  });
