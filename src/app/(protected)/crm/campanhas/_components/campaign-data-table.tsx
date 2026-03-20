"use client";

import { DataTable } from "@/components/ui/data-table";

import { Campaign, createCampaignColumns } from "./campaign-table-columns";

interface CampaignDataTableProps {
  data: Campaign[];
}

const CampaignDataTable = ({ data }: CampaignDataTableProps) => {
  const columns = createCampaignColumns();
  return <DataTable data={data} columns={columns} />;
};

export default CampaignDataTable;
