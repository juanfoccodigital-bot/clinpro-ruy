"use client";

import {
  CalendarDays,
  CheckSquare,
  Clock,
  Mail,
  Phone,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteContact,
  getContactChecklist,
  getStageChecklistItems,
  moveContactToStage,
  removeContactFromPipeline,
  toggleContactChecklist,
  updateContact,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface ContactWithStage {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string;
  createdAt: Date;
  leadSource?: string | null;
  leadSourceDetail?: string | null;
  leadAdName?: string | null;
  stage: {
    id: string;
    stageId: string;
    notes: string | null;
  } | null;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface ChecklistItem {
  id: string;
  label: string;
  order: number;
}

interface ChecklistStatus {
  id: string;
  checklistItemId: string;
  completed: boolean;
  completedAt: Date | null;
}

interface ContactDetailDialogProps {
  contact: ContactWithStage | null;
  stages: PipelineStage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactDetailDialog({
  contact,
  stages,
  open,
  onOpenChange,
}: ContactDetailDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [stageId, setStageId] = useState("");
  const [notes, setNotes] = useState("");

  // Checklist state
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [checklistStatus, setChecklistStatus] = useState<ChecklistStatus[]>([]);
  const [loadingChecklist, setLoadingChecklist] = useState(false);

  // Sync form when contact changes
  const [lastContactId, setLastContactId] = useState<string | null>(null);

  const loadChecklist = useCallback(async (currentStageId: string, contactStageId: string) => {
    setLoadingChecklist(true);
    try {
      const [items, status] = await Promise.all([
        getStageChecklistItems(currentStageId),
        getContactChecklist(contactStageId),
      ]);
      setChecklistItems(items);
      setChecklistStatus(status);
    } catch {
      // silently fail
    } finally {
      setLoadingChecklist(false);
    }
  }, []);

  if (contact && contact.id !== lastContactId) {
    setLastContactId(contact.id);
    setName(contact.name || "");
    setEmail(contact.email || "");
    setPhone(contact.phoneNumber || "");
    setStageId(contact.stage?.stageId || "none");
    setNotes(contact.stage?.notes || "");
    setChecklistItems([]);
    setChecklistStatus([]);
  }

  useEffect(() => {
    if (open && contact?.stage?.stageId && contact?.stage?.id) {
      loadChecklist(contact.stage.stageId, contact.stage.id);
    }
  }, [open, contact?.stage?.stageId, contact?.stage?.id, loadChecklist]);

  if (!contact) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateContact({
          id: contact.id,
          name,
          email,
          phoneNumber: phone,
        });

        if (stageId === "none") {
          if (contact.stage) {
            await removeContactFromPipeline(contact.id);
          }
        } else {
          await moveContactToStage({
            patientId: contact.id,
            stageId,
            notes: notes || undefined,
          });
        }

        toast.success("Contato atualizado com sucesso");
        router.refresh();
        onOpenChange(false);
      } catch {
        toast.error("Erro ao atualizar contato");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteContact(contact.id);
        toast.success("Contato excluido com sucesso");
        router.refresh();
        onOpenChange(false);
        setShowDeleteConfirm(false);
      } catch {
        toast.error("Erro ao excluir contato");
      }
    });
  };

  const handleToggleChecklist = (checklistItemId: string, currentCompleted: boolean) => {
    if (!contact.stage?.id) return;
    startTransition(async () => {
      try {
        const result = await toggleContactChecklist({
          contactStageId: contact.stage!.id,
          checklistItemId,
          completed: !currentCompleted,
        });
        // Update local state
        setChecklistStatus((prev) => {
          const existing = prev.find((s) => s.checklistItemId === checklistItemId);
          if (existing) {
            return prev.map((s) =>
              s.checklistItemId === checklistItemId
                ? { ...s, completed: !currentCompleted, completedAt: !currentCompleted ? new Date() : null }
                : s,
            );
          }
          return [
            ...prev,
            {
              id: "temp",
              checklistItemId,
              completed: true,
              completedAt: new Date(),
            },
          ];
        });
        if (result?.autoMoved && result.newStageName) {
          toast.success(`Checklist completo! Contato movido para "${result.newStageName}"`);
          onOpenChange(false);
        }
        router.refresh();
      } catch {
        toast.error("Erro ao atualizar checklist");
      }
    });
  };

  const isItemCompleted = (itemId: string) => {
    return checklistStatus.find((s) => s.checklistItemId === itemId)?.completed ?? false;
  };

  const getItemCompletedAt = (itemId: string) => {
    return checklistStatus.find((s) => s.checklistItemId === itemId)?.completedAt ?? null;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <User className="h-4 w-4 text-amber-600" />
              </div>
              Detalhes do Contato
            </DialogTitle>
            <DialogDescription>
              Visualize e edite as informacoes do contato.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name" className="flex items-center gap-1.5 text-sm font-medium">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Nome
              </Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do contato"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="flex items-center gap-1.5 text-sm font-medium">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-phone" className="flex items-center gap-1.5 text-sm font-medium">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Telefone
                </Label>
                <Input
                  id="contact-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                Data de cadastro
              </Label>
              <p className="text-sm text-muted-foreground">
                {formatDate(contact.createdAt)}
              </p>
            </div>

            {/* Lead source info */}
            {contact.leadSource && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Origem do Lead
                </Label>
                <p className="text-sm font-medium">
                  {contact.leadSource === "facebook" && "Facebook"}
                  {contact.leadSource === "instagram" && "Instagram"}
                  {contact.leadSource === "indicacao" && "Indicacao"}
                  {contact.leadSource === "google" && "Google"}
                  {contact.leadSource === "site" && "Site"}
                  {contact.leadSource === "outro" && "Outro"}
                </p>
                {contact.leadSourceDetail && (
                  <p className="text-xs text-muted-foreground">
                    Detalhe: {contact.leadSourceDetail}
                  </p>
                )}
                {contact.leadAdName && (
                  <p className="text-xs text-muted-foreground">
                    Anuncio: {contact.leadAdName}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="contact-stage" className="text-sm font-medium">
                Etapa do Pipeline
              </Label>
              <Select value={stageId} onValueChange={setStageId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem etapa</SelectItem>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        {stage.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Checklist section */}
            {contact.stage && checklistItems.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  Checklist da Etapa
                </Label>
                <div className="rounded-lg border p-3 space-y-2">
                  {loadingChecklist ? (
                    <p className="text-xs text-muted-foreground">Carregando...</p>
                  ) : (
                    checklistItems.map((item) => {
                      const completed = isItemCompleted(item.id);
                      const completedAt = getItemCompletedAt(item.id);
                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-2 py-1"
                        >
                          <Checkbox
                            checked={completed}
                            onCheckedChange={() => handleToggleChecklist(item.id, completed)}
                            disabled={isPending}
                            className="mt-0.5 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                          />
                          <div className="flex-1">
                            <span
                              className={`text-sm ${completed ? "line-through text-muted-foreground" : ""}`}
                            >
                              {item.label}
                            </span>
                            {completed && completedAt && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                {formatDateTime(completedAt)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="contact-notes" className="text-sm font-medium">
                Observacoes
              </Label>
              <Textarea
                id="contact-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicionar observacoes sobre este contato..."
                className="min-h-20 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Excluir
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              <Save className="mr-1 h-3.5 w-3.5" />
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir contato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{contact.name}&quot;? Esta acao
              nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
