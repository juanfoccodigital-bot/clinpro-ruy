"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { whatsappConnectionsTable } from "@/db/schema";
import { EvolutionApiClient } from "@/lib/evolution-api";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const checkWhatsappStatus = protectedWithClinicActionClient
  .schema(
    z.object({
      connectionId: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const connection = await db.query.whatsappConnectionsTable.findFirst({
      where: eq(whatsappConnectionsTable.id, parsedInput.connectionId),
    });

    if (!connection || connection.clinicId !== ctx.user.clinic.id) {
      throw new Error("Conexao nao encontrada.");
    }

    const client = new EvolutionApiClient({
      apiUrl: connection.apiUrl,
      apiKey: connection.apiKey,
      instanceName: connection.instanceName,
    });

    try {
      const result = await client.getInstanceStatus();
      const state = result?.instance?.state || result?.state || "close";

      const statusMap: Record<string, "connected" | "disconnected" | "connecting"> = {
        open: "connected",
        close: "disconnected",
        connecting: "connecting",
      };

      const newStatus = statusMap[state] || "disconnected";

      if (connection.status !== newStatus) {
        await db
          .update(whatsappConnectionsTable)
          .set({ status: newStatus })
          .where(eq(whatsappConnectionsTable.id, connection.id));
        revalidatePath("/whatsapp");
      }

      return { status: newStatus };
    } catch {
      return { status: "disconnected" as const };
    }
  });
