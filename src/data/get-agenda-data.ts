import { and, desc, eq, gte, lte } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentsTable,
  doctorScheduleBlocksTable,
  waitingListTable,
} from "@/db/schema";

interface GetAgendaDataParams {
  clinicId: string;
  startDate: string;
  endDate: string;
}

export const getAgendaData = async ({
  clinicId,
  startDate,
  endDate,
}: GetAgendaDataParams) => {
  const appointments = await db.query.appointmentsTable.findMany({
    where: and(
      eq(appointmentsTable.clinicId, clinicId),
      gte(appointmentsTable.date, new Date(startDate)),
      lte(appointmentsTable.date, new Date(endDate)),
    ),
    with: {
      patient: true,
      doctor: true,
    },
  });

  return appointments;
};

interface GetScheduleBlocksParams {
  clinicId: string;
}

export const getScheduleBlocks = async ({
  clinicId,
}: GetScheduleBlocksParams) => {
  const blocks = await db.query.doctorScheduleBlocksTable.findMany({
    where: eq(doctorScheduleBlocksTable.clinicId, clinicId),
    with: {
      doctor: true,
    },
  });

  return blocks;
};

interface GetWaitingListParams {
  clinicId: string;
}

export const getWaitingList = async ({ clinicId }: GetWaitingListParams) => {
  const items = await db.query.waitingListTable.findMany({
    where: eq(waitingListTable.clinicId, clinicId),
    with: {
      patient: true,
      doctor: true,
    },
    orderBy: [desc(waitingListTable.createdAt)],
  });

  return items;
};
