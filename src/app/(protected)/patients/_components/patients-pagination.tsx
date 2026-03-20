"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PatientsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  search: string;
}

export default function PatientsPagination({
  page,
  totalPages,
  total,
  search,
}: PatientsPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);

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

  const goToPage = (newPage: number) => {
    const qs = createQueryString({
      page: newPage > 1 ? String(newPage) : undefined,
    });
    router.push(`/patients${qs ? `?${qs}` : ""}`);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue !== search) {
        const qs = createQueryString({
          search: searchValue || undefined,
          page: undefined,
        });
        router.push(`/patients${qs ? `?${qs}` : ""}`);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchValue, search, createQueryString, router]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {total} paciente{total !== 1 ? "s" : ""}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <span className="flex items-center gap-1 text-sm font-medium">
              <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-amber-500 px-2 text-white">
                {page}
              </span>
              <span className="text-muted-foreground">de {totalPages}</span>
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
