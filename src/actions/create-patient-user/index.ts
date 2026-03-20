"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { patientUsersTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";
import { hashPassword } from "@/lib/portal-auth";

import { createPatientUserSchema } from "./schema";

export const createPatientUser = protectedWithClinicActionClient
  .schema(createPatientUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    // Check if email already exists for this clinic
    const existing = await db.query.patientUsersTable.findFirst({
      where: eq(patientUsersTable.email, parsedInput.email.toLowerCase()),
    });
    if (existing) {
      throw new Error("Este email ja esta em uso.");
    }

    const passwordHash = await hashPassword(parsedInput.password);

    await db.insert(patientUsersTable).values({
      clinicId: ctx.user.clinic.id,
      patientId: parsedInput.patientId,
      email: parsedInput.email.toLowerCase(),
      passwordHash,
    });

    revalidatePath("/patients");
  });
