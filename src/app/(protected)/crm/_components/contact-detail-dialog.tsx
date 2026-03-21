"use client";

import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  CheckSquare,
  Clock,
  FileText,
  History,
  Mail,
  MoveRight,
  Phone,
  Save,
  StickyNote,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteContact,
  getContactActivities,
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
  moveToStageId?: string | null;
}

interface ChecklistStatus {
  id: string;
  checklistItemId: string;
  completed: boolean;
  completedAt: Date | null;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  metadata: Record<string, unknown> | null;
  createdBy: string | null;
  createdAt: Date;
}

interface ContactDetailDialogProps {
  contact: ContactWithStage | null;
  stages: PipelineStage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACTIVITY_CONFIG: Record<
  string,
  { icon: typeof MoveRight; colorClass: string; bgClass: string; borderClass: string }
> = {
  stage_moved: {
    icon: MoveRight,
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-200",
  },
  checklist_completed: {
    icon: CheckCircle2,
    colorClass: "text-green-600",
    bgClass: "bg-green-50",
    borderClass: "border-green-200",
  },
  note_added: {
    icon: StickyNote,
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
  },
  contact_created: {
    icon: UserPlus,
    colorClass: "text-purple-600",
    bgClass: "bg-purple-50",
    borderClass: "border-purple-200",
  },
  appointment_created: {
    icon: CalendarPlus,
    colorClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
  },
  data_updated: {
    icon: FileText,
    colorClass: "text-gray-600",
    bgClass: "bg-gray-50",
    borderClass: "border-gray-200",
  },
};

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

  // Activity state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");

  // Sync form when contact changes
  const [lastContactId, setLastContactId] = useState<string | null>(null);

  const loadChecklist = useCallback(async (currentStageId: string, contactStageId: string) => {
    setLoadingChecklist(true);
    try {
      const [items, status] = await Promise.all([
        getStageChecklistItems(currentStageId),
        getContactChecklist(contactStageId),
      ]);
      setChecklistItems(items as ChecklistItem[]);
      setChecklistStatus(status);
    } catch {
      // silently fail
    } finally {
      setLoadingChecklist(false);
    }
  }, []);

  const loadActivities = useCallback(async (patientId: string) => {
    setLoadingActivities(true);
    try {
      const result = await getContactActivities(patientId);
      setActivities(result as Activity[]);
    } catch {
      setActivities([]);
    } finally {
      setLoadingActivities(false);
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
    setActivities([]);
    setActiveTab("details");
  }

  useEffect(() => {
    if (open && contact?.stage?.stageId && contact?.stage?.id) {
      loadChecklist(contact.stage.stageId, contact.stage.id);
    }
  }, [open, contact?.stage?.stageId, contact?.stage?.id, loadChecklist]);

  useEffect(() => {
    if (open && contact?.id) {
      loadActivities(contact.id);
    }
  }, [open, contact?.id, loadActivities]);

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
        // Reload activities after checklist toggle
        loadActivities(contact.id);
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

  const getStageById = (id: string) => stages.find((s) => s.id === id);

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

          {/* Tab navigation */}
          <div className="flex gap-1 border-b">
            <button
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "details"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("details")}
            >
              <User className="mr-1.5 inline h-3.5 w-3.5" />
              Dados
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "history"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("history")}
            >
              <History className="mr-1.5 inline h-3.5 w-3.5" />
              Historico
              {activities.length > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-semibold text-amber-700">
                  {activities.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === "details" && (
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
                        const ruleStage = item.moveToStageId
                          ? getStageById(item.moveToStageId)
                          : null;
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
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-sm ${completed ? "line-through text-muted-foreground" : ""}`}
                                >
                                  {item.label}
                                </span>
                                {ruleStage && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-600 border border-blue-200">
                                    <ArrowRight className="h-2 w-2" />
                                    {ruleStage.name}
                                  </span>
                                )}
                              </div>
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
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {loadingActivities ? (
                <p className="text-sm text-muted-foreground text-center py-8">Carregando historico...</p>
              ) : activities.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <History className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma atividade registrada.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

                  <div className="space-y-3">
                    {activities.map((activity) => {
                      const config = ACTIVITY_CONFIG[activity.type] || ACTIVITY_CONFIG.data_updated;
                      const IconComponent = config.icon;
                      return (
                        <div key={activity.id} className="relative flex gap-3 pl-0">
                          <div
                            className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${config.bgClass} ${config.borderClass}`}
                          >
                            <IconComponent className={`h-3.5 w-3.5 ${config.colorClass}`} />
                          </div>
                          <div className="flex-1 pt-0.5">
                            <p className="text-sm font-medium leading-tight">
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground">
                                {formatDateTime(activity.createdAt)}
                              </span>
                              {activity.createdBy && (
                                <span className="text-[10px] text-muted-foreground">
                                  por {activity.createdBy}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

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
