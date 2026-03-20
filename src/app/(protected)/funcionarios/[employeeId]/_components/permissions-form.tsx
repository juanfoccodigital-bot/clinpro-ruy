"use client";

import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { upsertEmployeePermissions } from "@/actions/upsert-employee-permissions";
import { Button } from "@/components/ui/button";
import { permissionsTable } from "@/db/schema";

const moduleLabels: Record<string, string> = {
  dashboard: "Dashboard",
  appointments: "Agenda de Procedimentos",
  agenda: "Agenda",
  patients: "Pacientes",
  medical_records: "Fichas Clínicas",
  documents: "Documentos",
  financial: "Financeiro",
  insurance: "Convenios",
  stock: "Estoque",
  employees: "Funcionarios",
  reports: "Relatorios",
  settings: "Configuracoes",
};

const allModules = [
  "dashboard",
  "appointments",
  "agenda",
  "patients",
  "medical_records",
  "documents",
  "financial",
  "insurance",
  "stock",
  "employees",
  "reports",
  "settings",
] as const;

type PermissionModule = (typeof allModules)[number];

interface PermissionRow {
  module: PermissionModule;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface PermissionsFormProps {
  employeeId: string;
  permissions: (typeof permissionsTable.$inferSelect)[];
}

const PermissionsForm = ({ employeeId, permissions }: PermissionsFormProps) => {
  const [rows, setRows] = useState<PermissionRow[]>([]);

  useEffect(() => {
    const initial: PermissionRow[] = allModules.map((mod) => {
      const existing = permissions.find((p) => p.module === mod);
      return {
        module: mod,
        canView: existing?.canView ?? false,
        canCreate: existing?.canCreate ?? false,
        canEdit: existing?.canEdit ?? false,
        canDelete: existing?.canDelete ?? false,
      };
    });
    setRows(initial);
  }, [permissions]);

  const upsertAction = useAction(upsertEmployeePermissions, {
    onSuccess: () => {
      toast.success("Permissoes salvas com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao salvar permissoes.");
    },
  });

  const togglePermission = (
    module: PermissionModule,
    field: "canView" | "canCreate" | "canEdit" | "canDelete",
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.module === module ? { ...row, [field]: !row[field] } : row,
      ),
    );
  };

  const handleSave = () => {
    upsertAction.execute({
      employeeId,
      permissions: rows.map((row) => ({
        module: row.module,
        canView: row.canView,
        canCreate: row.canCreate,
        canEdit: row.canEdit,
        canDelete: row.canDelete,
      })),
    });
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left font-medium">Modulo</th>
              <th className="py-2 text-center font-medium">Visualizar</th>
              <th className="py-2 text-center font-medium">Criar</th>
              <th className="py-2 text-center font-medium">Editar</th>
              <th className="py-2 text-center font-medium">Excluir</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.module} className="border-b">
                <td className="py-2 font-medium">
                  {moduleLabels[row.module] ?? row.module}
                </td>
                <td className="py-2 text-center">
                  <input
                    type="checkbox"
                    checked={row.canView}
                    onChange={() => togglePermission(row.module, "canView")}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </td>
                <td className="py-2 text-center">
                  <input
                    type="checkbox"
                    checked={row.canCreate}
                    onChange={() => togglePermission(row.module, "canCreate")}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </td>
                <td className="py-2 text-center">
                  <input
                    type="checkbox"
                    checked={row.canEdit}
                    onChange={() => togglePermission(row.module, "canEdit")}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </td>
                <td className="py-2 text-center">
                  <input
                    type="checkbox"
                    checked={row.canDelete}
                    onChange={() => togglePermission(row.module, "canDelete")}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={upsertAction.isPending}>
          {upsertAction.isPending ? "Salvando..." : "Salvar Permissoes"}
        </Button>
      </div>
    </div>
  );
};

export default PermissionsForm;
