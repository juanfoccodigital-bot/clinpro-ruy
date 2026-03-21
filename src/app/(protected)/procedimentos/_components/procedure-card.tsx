"use client";

import {
  Clock,
  DollarSign,
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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

interface ProcedureCardProps {
  procedure: ProcedureData;
  stockItems: (typeof stockItemsTable.$inferSelect)[];
}

const ProcedureCard = ({ procedure, stockItems }: ProcedureCardProps) => {
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
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="font-semibold leading-tight">{procedure.name}</h3>
            {procedure.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {procedure.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1.5">
            <Badge
              variant="outline"
              className="text-xs"
            >
              {CATEGORY_LABELS[procedure.category] ?? procedure.category}
            </Badge>
            {procedure.isActive ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 text-xs">
                Ativo
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Inativo
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex-1 space-y-2 pt-3">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <DollarSign className="h-3 w-3" />
            {formatCurrencyInCents(procedure.defaultPriceInCents)}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {procedure.durationMinutes} min
          </Badge>
        </div>

        {procedure.stockItems.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Package className="h-3 w-3" />
              Materiais utilizados
            </p>
            <div className="space-y-1">
              {procedure.stockItems.map((si) => (
                <div
                  key={si.id}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1 text-xs"
                >
                  <span>{si.stockItem.name}</span>
                  <span className="font-medium text-muted-foreground">
                    x{Number(si.quantityUsed)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="flex gap-2 pt-3">
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Pencil className="mr-1 h-4 w-4" />
              Editar
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
            <Button variant="outline" size="sm" className="shrink-0">
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
      </CardFooter>
    </Card>
  );
};

export default ProcedureCard;
