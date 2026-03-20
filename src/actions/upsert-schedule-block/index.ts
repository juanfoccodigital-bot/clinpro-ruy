"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { doctorScheduleBlocksTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertScheduleBlockSchema } from "./schema";

export const upsertScheduleBlock = protectedWithClinicActionClient
  .schema(upsertScheduleBlockSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { startDate, endDate, doctorId, ...rest } = parsedInput;

    const values = {
      ...rest,
      doctorId: doctorId || "",
      clinicId: ctx.user.clinic.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    await db
      .insert(doctorScheduleBlocksTable)
      .values(values)
      .onConflictDoUpdate({
        target: [doctorScheduleBlocksTable.id],
        set: values,
      });
    revalidatePath("/agenda");
  });
