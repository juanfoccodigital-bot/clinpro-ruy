"use client";

import { Filter } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { doctorsTable } from "@/db/schema";

interface DoctorFilterProps {
  doctors: (typeof doctorsTable.$inferSelect)[];
  selectedDoctorIds: string[];
  onChange: (ids: string[]) => void;
}

const DoctorFilter = ({
  doctors,
  selectedDoctorIds,
  onChange,
}: DoctorFilterProps) => {
  const handleToggle = (doctorId: string) => {
    if (selectedDoctorIds.includes(doctorId)) {
      onChange(selectedDoctorIds.filter((id) => id !== doctorId));
    } else {
      onChange([...selectedDoctorIds, doctorId]);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-1 h-4 w-4" />
          Filtrar profissionais
          {selectedDoctorIds.length > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {selectedDoctorIds.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Profissionais</span>
          {selectedDoctorIds.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs font-normal text-muted-foreground hover:text-foreground"
            >
              Limpar filtros
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto p-1">
          {doctors.map((doctor) => {
            const isSelected = selectedDoctorIds.includes(doctor.id);
            return (
              <button
                key={doctor.id}
                onClick={() => handleToggle(doctor.id)}
                className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent ${
                  isSelected ? "bg-accent" : ""
                }`}
              >
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={doctor.avatarImageUrl ?? undefined} />
                  <AvatarFallback className="text-[10px]">
                    {doctor.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm">{doctor.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {doctor.specialty}
                  </span>
                </div>
              </button>
            );
          })}
          {doctors.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhum profissional cadastrado.
            </p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DoctorFilter;
