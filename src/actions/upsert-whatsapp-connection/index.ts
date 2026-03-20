"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { whatsappConnectionsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertWhatsappConnectionSchema } from "./schema";

export const upsertWhatsappConnection = protectedWithClinicActionClient
  .schema(upsertWhatsappConnectionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const values = {
      ...parsedInput,
      clinicId: ctx.user.clinic.id,
    };

    await db
      .insert(whatsappConnectionsTable)
      .values(values)
      .onConflictDoUpdate({
        target: [whatsappConnectionsTable.id],
        set: values,
      });
    revalidatePath("/whatsapp");
  });
