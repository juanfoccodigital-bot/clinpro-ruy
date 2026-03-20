"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";

import { patientsTable, satisfactionSurveysTable } from "@/db/schema";

import SurveyTableActions from "./survey-table-actions";

export type SurveyWithPatient = typeof satisfactionSurveysTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect;
};

const getScoreColor = (score: number) => {
  if (score >= 9) return "text-green-600 bg-green-50";
  if (score >= 7) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
};

export const createSurveyColumns = (): ColumnDef<SurveyWithPatient>[] => [
  {
    id: "patientName",
    header: "Paciente",
    cell: (params) => {
      const survey = params.row.original;
      return survey.patient?.name ?? "-";
    },
  },
  {
    id: "score",
    accessorKey: "score",
    header: "Nota",
    cell: (params) => {
      const survey = params.row.original;
      return (
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${getScoreColor(survey.score)}`}
        >
          {survey.score}
        </span>
      );
    },
  },
  {
    id: "comment",
    accessorKey: "comment",
    header: "Comentario",
    cell: (params) => {
      const survey = params.row.original;
      if (!survey.comment) return "-";
      return (
        <span className="max-w-[300px] truncate" title={survey.comment}>
          {survey.comment}
        </span>
      );
    },
  },
  {
    id: "respondedAt",
    accessorKey: "respondedAt",
    header: "Respondido em",
    cell: (params) => {
      const survey = params.row.original;
      if (!survey.respondedAt) {
        return (
          <span className="text-muted-foreground">Pendente</span>
        );
      }
      return dayjs(survey.respondedAt).format("DD/MM/YYYY");
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const survey = params.row.original;
      return <SurveyTableActions survey={survey} />;
    },
  },
];
