"use client";

import { CreditCard, Edit, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deletePaymentMachine } from "@/actions/payment-machines";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { paymentMachinesTable } from "@/db/schema";

import UpsertMachineForm from "./upsert-machine-form";

type Machine = typeof paymentMachinesTable.$inferSelect;

interface MachinesListProps {
  machines: Machine[];
}

type FeeKey =
  | "debitFee"
  | "creditFee"
  | "credit2xFee"
  | "credit3xFee"
  | "credit4xFee"
  | "credit5xFee"
  | "credit6xFee"
  | "credit7_12xFee"
  | "pixFee";

const feeLabels: { key: FeeKey; label: string }[] = [
  { key: "debitFee", label: "Débito" },
  { key: "creditFee", label: "Crédito 1x" },
  { key: "credit2xFee", label: "Crédito 2x" },
  { key: "credit3xFee", label: "Crédito 3x" },
  { key: "credit4xFee", label: "Crédito 4x" },
  { key: "credit5xFee", label: "Crédito 5x" },
  { key: "credit6xFee", label: "Crédito 6x" },
  { key: "credit7_12xFee", label: "Crédito 7-12x" },
  { key: "pixFee", label: "PIX" },
];

const MachinesList = ({ machines }: MachinesListProps) => {
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const deleteAction = useAction(deletePaymentMachine, {
    onSuccess: () => {
      toast.success("Maquininha excluída com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao excluir maquininha.");
    },
  });

  if (machines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-amber-200 bg-amber-50/30 py-16">
        <CreditCard className="h-12 w-12 text-amber-400 mb-3" />
        <p className="text-lg font-medium text-amber-900">
          Nenhuma maquininha cadastrada
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione sua primeira maquininha para calcular taxas automaticamente.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {machines.map((machine) => (
          <Card
            key={machine.id}
            className="relative overflow-hidden border-amber-100"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle className="text-base">{machine.name}</CardTitle>
                <Badge
                  variant="outline"
                  className="mt-1 border-amber-200 bg-amber-50 text-amber-800"
                >
                  {machine.provider}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Dialog
                  open={editOpen && editingMachine?.id === machine.id}
                  onOpenChange={(open) => {
                    setEditOpen(open);
                    if (!open) setEditingMachine(null);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingMachine(machine);
                        setEditOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <UpsertMachineForm
                    isOpen={editOpen && editingMachine?.id === machine.id}
                    machine={machine}
                    onSuccess={() => {
                      setEditOpen(false);
                      setEditingMachine(null);
                    }}
                  />
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir maquininha?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Essa ação não pode ser desfeita. A maquininha &quot;{machine.name}&quot; será removida permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteAction.execute({ id: machine.id })}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-x-3 gap-y-1.5 text-sm">
                {feeLabels.map(({ key, label }) => {
                  const val = machine[key];
                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-[11px] text-muted-foreground">
                        {label}
                      </span>
                      <span className="font-medium">{val}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default MachinesList;
