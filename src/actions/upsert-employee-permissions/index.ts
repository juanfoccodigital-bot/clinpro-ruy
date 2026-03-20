"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { employeesTable, permissionsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertEmployeePermissionsSchema } from "./schema";

export const upsertEmployeePermissions = protectedWithClinicActionClient
  .schema(upsertEmployeePermissionsSchema)
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

    await db
      .delete(permissionsTable)
      .where(eq(permissionsTable.employeeId, parsedInput.employeeId));

    if (parsedInput.permissions.length > 0) {
      await db.insert(permissionsTable).values(
        parsedInput.permissions.map((permission) => ({
          ...permission,
          clinicId: ctx.user.clinic.id,
          employeeId: parsedInput.employeeId,
        })),
      );
    }

    revalidatePath("/funcionarios");
  });
