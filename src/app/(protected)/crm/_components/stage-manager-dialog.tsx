"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  Palette,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createPipelineStage,
  deletePipelineStage,
  reorderPipelineStages,
  updatePipelineStage,
} from "@/actions/crm-pipeline";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { PipelineStage } from "./contact-detail-dialog";

const PRESET_COLORS = [
  "#f59e0b", // amber
  "#ef4444", // red
  "#f97316", // orange
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#ec4899", // pink
  "#64748b", // slate
  "#78716c", // stone
];

interface StageManagerDialogProps {
  stages: PipelineStage[];
}

export default function StageManagerDialog({ stages }: StageManagerDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [deleteStageId, setDeleteStageId] = useState<string | null>(null);

  // New stage form
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [showNewForm, setShowNewForm] = useState(false);

  // Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleCreateStage = () => {
    if (!newName.trim()) {
      toast.error("Digite um nome para a etapa");
      return;
    }
    startTransition(async () => {
      try {
        await createPipelineStage({ name: newName.trim(), color: newColor });
        toast.success("Etapa criada com sucesso");
        setNewName("");
        setNewColor(PRESET_COLORS[0]);
        setShowNewForm(false);
        router.refresh();
      } catch {
        toast.error("Erro ao criar etapa");
      }
    });
  };

  const handleUpdateStage = (id: string) => {
    if (!editName.trim()) {
      toast.error("O nome nao pode ficar vazio");
      return;
    }
    startTransition(async () => {
      try {
        await updatePipelineStage({ id, name: editName.trim(), color: editColor });
        toast.success("Etapa atualizada");
        setEditingId(null);
        router.refresh();
      } catch {
        toast.error("Erro ao atualizar etapa");
      }
    });
  };

  const handleDeleteStage = () => {
    if (!deleteStageId) return;
    startTransition(async () => {
      try {
        await deletePipelineStage(deleteStageId);
        toast.success("Etapa excluida");
        setDeleteStageId(null);
        router.refresh();
      } catch {
        toast.error("Erro ao excluir etapa");
      }
    });
  };

  const handleMoveStage = (stageId: string, direction: "up" | "down") => {
    const sortedStages = [...stages].sort((a, b) => a.order - b.order);
    const index = sortedStages.findIndex((s) => s.id === stageId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sortedStages.length - 1)
    ) {
      return;
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const newOrder = sortedStages.map((s, i) => {
      if (i === index) return { id: s.id, order: swapIndex };
      if (i === swapIndex) return { id: s.id, order: index };
      return { id: s.id, order: i };
    });

    startTransition(async () => {
      try {
        await reorderPipelineStages(newOrder);
        router.refresh();
      } catch {
        toast.error("Erro ao reordenar etapas");
      }
    });
  };

  const startEditing = (stage: PipelineStage) => {
    setEditingId(stage.id);
    setEditName(stage.name);
    setEditColor(stage.color);
  };

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="mr-1.5 h-3.5 w-3.5" />
            Gerenciar Etapas
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <Palette className="h-4 w-4 text-amber-600" />
              </div>
              Gerenciar Etapas
            </DialogTitle>
            <DialogDescription>
              Organize as etapas do seu pipeline de vendas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {sortedStages.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Nenhuma etapa criada. Adicione sua primeira etapa abaixo.
              </div>
            )}

            {sortedStages.map((stage, index) => (
              <div
                key={stage.id}
                className="flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                {editingId === stage.id ? (
                  <div className="flex-1 space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nome da etapa"
                      className="h-8"
                    />
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Cor</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className="relative h-6 w-6 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                            style={{ backgroundColor: color }}
                            onClick={() => setEditColor(color)}
                          >
                            {editColor === color && (
                              <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-7 bg-amber-500 text-white hover:bg-amber-600"
                        onClick={() => handleUpdateStage(stage.id)}
                        disabled={isPending}
                      >
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7"
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span
                      className="flex-1 cursor-pointer text-sm font-medium hover:text-amber-600"
                      onClick={() => startEditing(stage)}
                    >
                      {stage.name}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        disabled={index === 0 || isPending}
                        onClick={() => handleMoveStage(stage.id, "up")}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        disabled={index === sortedStages.length - 1 || isPending}
                        onClick={() => handleMoveStage(stage.id, "down")}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteStageId(stage.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {showNewForm ? (
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome da nova etapa"
                className="h-8"
                autoFocus
              />
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cor</Label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="relative h-6 w-6 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                      style={{ backgroundColor: color }}
                      onClick={() => setNewColor(color)}
                    >
                      {newColor === color && (
                        <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="h-7 bg-amber-500 text-white hover:bg-amber-600"
                  onClick={handleCreateStage}
                  disabled={isPending}
                >
                  {isPending ? "Criando..." : "Criar Etapa"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewName("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setShowNewForm(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Adicionar Etapa
            </Button>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteStageId !== null}
        onOpenChange={(v) => {
          if (!v) setDeleteStageId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir etapa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta etapa? Os contatos nesta etapa
              ficarao sem etapa definida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStage}
              disabled={isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
