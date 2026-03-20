import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { employeesTable, timeTrackingTable } from "@/db/schema";

interface GetEmployeesParams {
  clinicId: string;
}

export const getEmployees = async ({ clinicId }: GetEmployeesParams) => {
  return db.query.employeesTable.findMany({
    where: eq(employeesTable.clinicId, clinicId),
    with: {
      permissions: true,
      doctor: true,
    },
    orderBy: [employeesTable.name],
  });
};

interface GetEmployeeParams {
  clinicId: string;
  employeeId: string;
}

export const getEmployee = async ({
  clinicId,
  employeeId,
}: GetEmployeeParams) => {
  return db.query.employeesTable.findFirst({
    where: and(
      eq(employeesTable.id, employeeId),
      eq(employeesTable.clinicId, clinicId),
    ),
    with: {
      permissions: true,
      timeRecords: {
        orderBy: [desc(timeTrackingTable.clockIn)],
      },
    },
  });
};
