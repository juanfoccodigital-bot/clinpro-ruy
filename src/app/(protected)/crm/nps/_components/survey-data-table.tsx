"use client";

import { DataTable } from "@/components/ui/data-table";

import {
  createSurveyColumns,
  SurveyWithPatient,
} from "./survey-table-columns";

interface SurveyDataTableProps {
  data: SurveyWithPatient[];
}

const SurveyDataTable = ({ data }: SurveyDataTableProps) => {
  const columns = createSurveyColumns();
  return <DataTable data={data} columns={columns} />;
};

export default SurveyDataTable;
