"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";

import AddQuickReplyButton from "./add-quick-reply-button";
import QuickReplyTableActions from "./quick-reply-table-actions";

export type QuickReply = {
  id: string;
  clinicId: string;
  shortcut: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

const columns: ColumnDef<QuickReply>[] = [
  {
    id: "shortcut",
    accessorKey: "shortcut",
    header: "Atalho",
    cell: (params) => {
      const reply = params.row.original;
      return (
        <span className="font-mono text-sm font-medium">/{reply.shortcut}</span>
      );
    },
  },
  {
    id: "content",
    accessorKey: "content",
    header: "Conteudo",
    cell: (params) => {
      const reply = params.row.original;
      return (
        <span className="max-w-[400px] truncate text-sm">{reply.content}</span>
      );
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const reply = params.row.original;
      return <QuickReplyTableActions quickReply={reply} />;
    },
  },
];

interface QuickRepliesViewProps {
  data: QuickReply[];
}

const QuickRepliesView = ({ data }: QuickRepliesViewProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddQuickReplyButton />
      </div>
      <DataTable data={data} columns={columns} />
    </div>
  );
};

export default QuickRepliesView;
