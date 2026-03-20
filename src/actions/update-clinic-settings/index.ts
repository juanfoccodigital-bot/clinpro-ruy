"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clinicsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { updateClinicSettingsSchema } from "./schema";

export const updateClinicSettings = protectedWithClinicActionClient
  .schema(updateClinicSettingsSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .update(clinicsTable)
      .set({
        name: parsedInput.name,
        logoUrl: parsedInput.logoUrl,
        primaryColor: parsedInput.primaryColor,
        secondaryColor: parsedInput.secondaryColor,
        accentColor: parsedInput.accentColor,
      })
      .where(eq(clinicsTable.id, ctx.user.clinic.id));

    revalidatePath("/configuracoes");
    revalidatePath("/dashboard");
    return { success: true };
  });
