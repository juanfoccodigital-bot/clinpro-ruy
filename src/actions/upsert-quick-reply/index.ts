"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { quickRepliesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertQuickReplySchema } from "./schema";

export const upsertQuickReply = protectedWithClinicActionClient
  .schema(upsertQuickReplySchema)
  .action(async ({ parsedInput, ctx }) => {
    const values = {
      ...parsedInput,
      clinicId: ctx.user.clinic.id,
    };

    await db
      .insert(quickRepliesTable)
      .values(values)
      .onConflictDoUpdate({
        target: [quickRepliesTable.id],
        set: values,
      });
    revalidatePath("/whatsapp");
  });
