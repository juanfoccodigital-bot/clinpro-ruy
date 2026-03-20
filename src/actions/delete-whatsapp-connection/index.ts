"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { whatsappConnectionsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteWhatsappConnection = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const connection = await db.query.whatsappConnectionsTable.findFirst({
      where: eq(whatsappConnectionsTable.id, parsedInput.id),
    });
    if (!connection) {
      throw new Error("Conexão WhatsApp não encontrada");
    }
    if (connection.clinicId !== ctx.user.clinic.id) {
      throw new Error("Conexão WhatsApp não encontrada");
    }
    await db
      .delete(whatsappConnectionsTable)
      .where(eq(whatsappConnectionsTable.id, parsedInput.id));
    revalidatePath("/whatsapp");
  });
