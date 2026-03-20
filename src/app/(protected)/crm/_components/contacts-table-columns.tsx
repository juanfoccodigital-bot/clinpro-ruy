"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MessageCircle, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export interface ContactRow {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  source: "whatsapp" | "manual";
  createdAt: Date;
}

export const contactsTableColumns: ColumnDef<ContactRow>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email || "—",
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Telefone",
    cell: ({ row }) => {
      const phone = row.original.phoneNumber;
      if (!phone) return "—";
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    },
  },
  {
    id: "source",
    accessorKey: "source",
    header: "Origem",
    cell: ({ row }) => {
      const source = row.original.source;
      return source === "whatsapp" ? (
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
          <MessageCircle className="mr-1 h-3 w-3" />
          WhatsApp
        </Badge>
      ) : (
        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
          <UserRound className="mr-1 h-3 w-3" />
          Manual
        </Badge>
      );
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Data",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      if (!date) return "—";
      return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
    },
  },
];
