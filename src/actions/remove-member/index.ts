"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { usersToClinicsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const removeMember = protectedWithClinicActionClient
  .schema(z.object({ userId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    // Check that the current user is owner or admin
    const currentMembership = await db.query.usersToClinicsTable.findFirst({
      where: and(
        eq(usersToClinicsTable.userId, ctx.user.id),
        eq(usersToClinicsTable.clinicId, ctx.user.clinic.id),
      ),
    });

    if (!currentMembership || !["owner", "admin"].includes(currentMembership.role)) {
      throw new Error("Sem permissao para remover membros");
    }

    // Cannot remove yourself
    if (parsedInput.userId === ctx.user.id) {
      throw new Error("Voce nao pode remover a si mesmo");
    }

    // Cannot remove owner
    const targetMembership = await db.query.usersToClinicsTable.findFirst({
      where: and(
        eq(usersToClinicsTable.userId, parsedInput.userId),
        eq(usersToClinicsTable.clinicId, ctx.user.clinic.id),
      ),
    });

    if (targetMembership?.role === "owner") {
      throw new Error("Nao e possivel remover o proprietario da clinica");
    }

    await db
      .delete(usersToClinicsTable)
      .where(
        and(
          eq(usersToClinicsTable.userId, parsedInput.userId),
          eq(usersToClinicsTable.clinicId, ctx.user.clinic.id),
        ),
      );

    revalidatePath("/configuracoes");
    return { success: true };
  });
