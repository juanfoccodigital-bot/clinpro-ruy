"use client";

import { Circle, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteWhatsappLabel } from "@/actions/delete-whatsapp-label";
import { upsertWhatsappLabel } from "@/actions/upsert-whatsapp-label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#06B6D4",
  "#3B82F6",
  "#D3AB32",
  "#D08C32",
  "#EC4899",
  "#F43F5E",
  "#14B8A6",
  "#84CC16",
];

interface LabelsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: { id: string; name: string; color: string }[];
}

export default function LabelsManager({
  open,
  onOpenChange,
  labels,
}: LabelsManagerProps) {
  const router = useRouter();
  const [editingLabel, setEditingLabel] = useState<{
    id?: string;
    name: string;
    color: string;
  } | null>(null);

  const upsertAction = useAction(upsertWhatsappLabel, {
    onSuccess: () => {
      toast.success(
        editingLabel?.id ? "Etiqueta atualizada!" : "Etiqueta criada!",
      );
      setEditingLabel(null);
      router.refresh();
    },
    onError: () => {
      toast.error("Erro ao salvar etiqueta.");
    },
  });

  const deleteAction = useAction(deleteWhatsappLabel, {
    onSuccess: () => {
      toast.success("Etiqueta excluida!");
      router.refresh();
    },
    onError: () => {
      toast.error("Erro ao excluir etiqueta.");
    },
  });

  const handleSave = () => {
    if (!editingLabel?.name.trim()) return;
    upsertAction.execute({
      id: editingLabel.id,
      name: editingLabel.name,
      color: editingLabel.color,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Etiquetas</DialogTitle>
          <DialogDescription>
            Crie e edite etiquetas para organizar suas conversas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing labels */}
          <div className="space-y-2">
            {labels.map((label) => (
              <div
                key={label.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Circle
                    className="h-4 w-4 shrink-0"
                    fill={label.color}
                    color={label.color}
                  />
                  <span className="text-sm">{label.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      setEditingLabel({
                        id: label.id,
                        name: label.name,
                        color: label.color,
                      })
                    }
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => deleteAction.execute({ id: label.id })}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {labels.length === 0 && !editingLabel && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhuma etiqueta criada ainda.
              </p>
            )}
          </div>

          {/* Create/Edit form */}
          {editingLabel ? (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome</Label>
                <Input
                  value={editingLabel.name}
                  onChange={(e) =>
                    setEditingLabel({ ...editingLabel, name: e.target.value })
                  }
                  placeholder="Nome da etiqueta"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className={`h-7 w-7 rounded-full transition-transform ${
                        editingLabel.color === color
                          ? "scale-110 ring-2 ring-primary ring-offset-2"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        setEditingLabel({ ...editingLabel, color })
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={upsertAction.isPending}
                  className="flex-1"
                >
                  {upsertAction.isPending && (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  )}
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingLabel(null)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                setEditingLabel({ name: "", color: COLORS[0] })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Etiqueta
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
