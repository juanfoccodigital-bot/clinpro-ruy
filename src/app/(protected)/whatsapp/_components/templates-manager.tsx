"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteMessageTemplate } from "@/actions/delete-message-template";
import { upsertMessageTemplate } from "@/actions/upsert-message-template";
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
import { Textarea } from "@/components/ui/textarea";

interface Template {
  id: string;
  name: string;
  content: string;
  category: string | null;
}

interface TemplatesManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: Template[];
}

export default function TemplatesManager({
  open,
  onOpenChange,
  templates,
}: TemplatesManagerProps) {
  const router = useRouter();
  const [editingTemplate, setEditingTemplate] = useState<{
    id?: string;
    name: string;
    content: string;
    category: string;
  } | null>(null);

  const upsertAction = useAction(upsertMessageTemplate, {
    onSuccess: () => {
      toast.success(
        editingTemplate?.id ? "Template atualizado!" : "Template criado!",
      );
      setEditingTemplate(null);
      router.refresh();
    },
    onError: () => {
      toast.error("Erro ao salvar template.");
    },
  });

  const deleteAction = useAction(deleteMessageTemplate, {
    onSuccess: () => {
      toast.success("Template excluido!");
      router.refresh();
    },
    onError: () => {
      toast.error("Erro ao excluir template.");
    },
  });

  const handleSave = () => {
    if (!editingTemplate?.name.trim() || !editingTemplate?.content.trim())
      return;
    upsertAction.execute({
      id: editingTemplate.id,
      name: editingTemplate.name,
      content: editingTemplate.content,
      category: editingTemplate.category || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerenciar Templates</DialogTitle>
          <DialogDescription>
            Crie templates de mensagens para enviar rapidamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing templates */}
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                className="rounded-lg border px-3 py-2"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{template.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {template.content}
                    </p>
                    {template.category && (
                      <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px]">
                        {template.category}
                      </span>
                    )}
                  </div>
                  <div className="ml-2 flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        setEditingTemplate({
                          id: template.id,
                          name: template.name,
                          content: template.content,
                          category: template.category || "",
                        })
                      }
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() =>
                        deleteAction.execute({ id: template.id })
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {templates.length === 0 && !editingTemplate && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum template criado ainda.
              </p>
            )}
          </div>

          {/* Create/Edit form */}
          {editingTemplate ? (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome</Label>
                <Input
                  value={editingTemplate.name}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      name: e.target.value,
                    })
                  }
                  placeholder="Ex: Boas-vindas"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Categoria (opcional)</Label>
                <Input
                  value={editingTemplate.category}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      category: e.target.value,
                    })
                  }
                  placeholder="Ex: Atendimento"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Conteudo</Label>
                <Textarea
                  value={editingTemplate.content}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      content: e.target.value,
                    })
                  }
                  placeholder="Digite o conteudo do template..."
                  rows={4}
                />
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
                  onClick={() => setEditingTemplate(null)}
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
                setEditingTemplate({
                  name: "",
                  content: "",
                  category: "",
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Template
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
