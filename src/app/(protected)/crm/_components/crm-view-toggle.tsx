"use client";

import {
  ChevronLeft,
  ChevronRight,
  Kanban,
  Search,
  Table2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ContactWithStage, PipelineStage } from "./contact-detail-dialog";
import { ContactRow, contactsTableColumns } from "./contacts-table-columns";
import KanbanBoard from "./kanban-board";

interface CrmViewToggleProps {
  contacts: ContactRow[];
  stages: PipelineStage[];
  contactsWithStages: ContactWithStage[];
  checklistData?: {
    stageItems: { id: string; stageId: string; label: string; order: number }[];
    contactChecklist: { id: string; contactStageId: string; checklistItemId: string; completed: boolean }[];
  };
  totalCount: number;
  currentPage: number;
  totalPages: number;
  search: string;
  view: string;
}

export default function CrmViewToggle({
  contacts,
  stages,
  contactsWithStages,
  checklistData,
  totalCount,
  currentPage,
  totalPages,
  search,
  view,
}: CrmViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const createQueryString = useCallback(
    (params: Record<string, string | undefined>) => {
      const current = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === "") {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      }
      return current.toString();
    },
    [searchParams],
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const qs = createQueryString({
        search: value || undefined,
        page: undefined,
      });
      router.push(`/crm${qs ? `?${qs}` : ""}`);
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleViewChange = (newView: string) => {
    const qs = createQueryString({
      view: newView,
      page: undefined,
    });
    router.push(`/crm${qs ? `?${qs}` : ""}`);
  };

  const handlePageChange = (newPage: number) => {
    const qs = createQueryString({
      page: newPage > 1 ? String(newPage) : undefined,
    });
    router.push(`/crm${qs ? `?${qs}` : ""}`);
  };

  const activeView = view === "tabela" ? "tabela" : "kanban";

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 border-amber-200 focus-visible:ring-amber-400"
        />
      </div>

      <Tabs
        value={activeView}
        onValueChange={handleViewChange}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="kanban" className="gap-1.5">
            <Kanban className="h-3.5 w-3.5" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="tabela" className="gap-1.5">
            <Table2 className="h-3.5 w-3.5" />
            Tabela
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <KanbanBoard stages={stages} contacts={contactsWithStages} checklistData={checklistData} />
        </TabsContent>

        <TabsContent value="tabela">
          <DataTable data={contacts} columns={contactsTableColumns} />

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando{" "}
                <span className="font-medium text-amber-600">
                  {(currentPage - 1) * 20 + 1}
                </span>{" "}
                a{" "}
                <span className="font-medium text-amber-600">
                  {Math.min(currentPage * 20, totalCount)}
                </span>{" "}
                de{" "}
                <span className="font-medium text-amber-600">{totalCount}</span>{" "}
                contatos
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página{" "}
                  <span className="font-medium text-amber-600">
                    {currentPage}
                  </span>{" "}
                  de{" "}
                  <span className="font-medium text-amber-600">
                    {totalPages}
                  </span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
