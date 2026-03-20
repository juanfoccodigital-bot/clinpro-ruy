"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { waitingListTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

import { upsertWaitingListItemSchema } from "./schema";

export const upsertWaitingListItem = protectedWithClinicActionClient
  .schema(upsertWaitingListItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { preferredDate, ...rest } = parsedInput;

    const values = {
      ...rest,
      clinicId: ctx.user.clinic.id,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
    };

    await db
      .insert(waitingListTable)
      .values(values)
      .onConflictDoUpdate({
        target: [waitingListTable.id],
        set: values,
      });
    revalidatePath("/agenda");
  });
