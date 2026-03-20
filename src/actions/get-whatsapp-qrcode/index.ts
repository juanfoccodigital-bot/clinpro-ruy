"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { whatsappConnectionsTable } from "@/db/schema";
import { EvolutionApiClient } from "@/lib/evolution-api";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const getWhatsappQrCode = protectedWithClinicActionClient
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

    const result = await client.getQrCode();
    return {
      qrCode: result?.qrcode?.base64 || result?.base64 || null,
    };
  });
