"use client";

import {
  Clock,
  Package,
  Pencil,
  Trash2,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteProcedure } from "@/actions/procedures";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { stockItemsTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";

import UpsertProcedureForm from "./upsert-procedure-form";

const CATEGORY_LABELS: Record<string, string> = {
  toxina_botulinica: "Toxina Botulínica",
  preenchimento: "Preenchimento",
  bioestimulador: "Bioestimulador",
  skinbooster: "Skinbooster",
  peeling: "Peeling",
  laser: "Laser",
  protocolo: "Protocolo",
  avaliacao: "Avaliação",
  retorno: "Retorno",
  outro: "Outro",
  general: "Geral",
};

interface ProcedureStockItem {
  id: string;
  stockItemId: string;
  quantityUsed: string;
  stockItem: {
    id: string;
    name: string;
  };
}

interface ProcedureData {
  id: string;
  name: string;
  description: string | null;
  category: string;
  defaultPriceInCents: number;
  durationMinutes: number;
  isActive: boolean;
  stockItems: ProcedureStockItem[];
}

interface ProcedureRowProps {
  procedure: ProcedureData;
  stockItems: (typeof stockItemsTable.$inferSelect)[];
}

const ProcedureRow = ({ procedure, stockItems }: ProcedureRowProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const deleteAction = useAction(deleteProcedure, {
    onSuccess: () => {
      toast.success("Procedimento deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar procedimento.");
    },
  });

  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium">{procedure.name}</p>
          {procedure.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {procedure.description}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {CATEGORY_LABELS[procedure.category] ?? procedure.category}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="font-semibold text-foreground">
          {formatCurrencyInCents(procedure.defaultPriceInCents)}
        </span>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {procedure.durationMinutes} min
        </span>
      </TableCell>
      <TableCell>
        {procedure.stockItems.length > 0 ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Package className="h-3.5 w-3.5" />
            {procedure.stockItems.length}
          </span>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </TableCell>
      <TableCell>
        {procedure.isActive ? (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            Ativo
          </Badge>
        ) : (
          <Badge variant="secondary">Inativo</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <UpsertProcedureForm
              procedure={{
                id: procedure.id,
                name: procedure.name,
                description: procedure.description,
                category: procedure.category,
                defaultPriceInCents: procedure.defaultPriceInCents,
                durationMinutes: procedure.durationMinutes,
                isActive: procedure.isActive,
                stockItems: procedure.stockItems.map((si) => ({
                  stockItemId: si.stockItemId,
                  quantityUsed: si.quantityUsed,
                })),
              }}
              stockItems={stockItems}
              onSuccess={() => setIsEditOpen(false)}
              isOpen={isEditOpen}
            />
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Tem certeza que deseja deletar?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  O procedimento &quot;{procedure.name}&quot; será removido
                  permanentemente. Agendamentos existentes não serão afetados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteAction.execute({ id: procedure.id })}
                >
                  Deletar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

interface ProceduresTableProps {
  procedures: ProcedureData[];
  stockItems: (typeof stockItemsTable.$inferSelect)[];
}

const ProceduresTable = ({ procedures, stockItems }: ProceduresTableProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border shadow-luxury bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Duração</TableHead>
            <TableHead>Materiais</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {procedures.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhum procedimento cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            procedures.map((procedure) => (
              <ProcedureRow
                key={procedure.id}
                procedure={procedure}
                stockItems={stockItems}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProceduresTable;
