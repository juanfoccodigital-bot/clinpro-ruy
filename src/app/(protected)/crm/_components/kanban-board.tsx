"use client";

import {
  ArrowRight,
  Check,
  Circle,
  GripVertical,
  Mail,
  MoreHorizontal,
  Phone,
  Settings2,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DragEvent, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteContact,
  moveContactToStage,
  removeContactFromPipeline,
  toggleContactChecklist,
} from "@/actions/crm-pipeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { ContactWithStage, PipelineStage } from "./contact-detail-dialog";
import ContactDetailDialog from "./contact-detail-dialog";
import StageManagerDialog from "./stage-manager-dialog";

interface ChecklistItem {
  id: string;
  stageId: string;
  label: string;
  order: number;
  moveToStageId?: string | null;
}

interface ChecklistCompletion {
  id: string;
  contactStageId: string;
  checklistItemId: string;
  completed: boolean;
}

interface KanbanBoardProps {
  stages: PipelineStage[];
  contacts: ContactWithStage[];
  checklistData?: {
    stageItems: ChecklistItem[];
    contactChecklist: ChecklistCompletion[];
  };
}

const LEAD_SOURCE_CONFIG: Record<string, { label: string; icon: string; bg: string; text: string; border: string }> = {
  facebook: { label: "Facebook", icon: "📘", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  instagram: { label: "Instagram", icon: "📸", bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  indicacao: { label: "Indicação", icon: "👤", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  google: { label: "Google", icon: "🔍", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  site: { label: "Site", icon: "🌐", bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
  outro: { label: "Outro", icon: "📌", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
};

export default function KanbanBoard({ stages, contacts, checklistData }: KanbanBoardProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selectedContact, setSelectedContact] = useState<ContactWithStage | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);

  // Index checklist items by stageId
  const itemsByStage = useMemo(() => {
    const map: Record<string, ChecklistItem[]> = {};
    if (!checklistData) return map;
    for (const item of checklistData.stageItems) {
      if (!map[item.stageId]) map[item.stageId] = [];
      map[item.stageId].push(item);
    }
    // Sort by order
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.order - b.order);
    }
    return map;
  }, [checklistData]);

  // Index completions by contactStageId+checklistItemId
  const completionSet = useMemo(() => {
    const set = new Set<string>();
    if (!checklistData) return set;
    for (const cc of checklistData.contactChecklist) {
      if (cc.completed) {
        set.add(`${cc.contactStageId}:${cc.checklistItemId}`);
      }
    }
    return set;
  }, [checklistData]);

  // Group contacts by stage
  const contactsByStage = useMemo(() => {
    const map: Record<string, ContactWithStage[]> = { unassigned: [] };
    sortedStages.forEach((s) => { map[s.id] = []; });
    contacts.forEach((c) => {
      const sid = c.stage?.stageId;
      if (sid && map[sid]) {
        map[sid].push(c);
      } else {
        map["unassigned"].push(c);
      }
    });
    return map;
  }, [contacts, sortedStages]);

  const handleOpenDetail = (contact: ContactWithStage) => {
    setSelectedContact(contact);
    setDetailOpen(true);
  };

  const handleMoveToStage = (contactId: string, stageId: string) => {
    startTransition(async () => {
      try {
        if (stageId === "unassigned") {
          await removeContactFromPipeline(contactId);
        } else {
          await moveContactToStage({ patientId: contactId, stageId });
        }
        toast.success("Contato movido");
        router.refresh();
      } catch {
        toast.error("Erro ao mover contato");
      }
    });
  };

  const handleToggleCheck = (contactStageId: string, checklistItemId: string, completed: boolean) => {
    startTransition(async () => {
      try {
        const result = await toggleContactChecklist({ contactStageId, checklistItemId, completed });
        if (result?.autoMoved) {
          toast.success(`Checklist completo! Movido para "${result.newStageName}"`);
        }
        router.refresh();
      } catch {
        toast.error("Erro ao atualizar checklist");
      }
    });
  };

  const handleDeleteContact = (contactId: string) => {
    startTransition(async () => {
      try {
        await deleteContact(contactId);
        toast.success("Contato excluído");
        router.refresh();
      } catch {
        toast.error("Erro ao excluir");
      }
    });
  };

  // Drag handlers
  const onDragStart = (e: DragEvent<HTMLDivElement>, contactId: string) => {
    e.dataTransfer.setData("text/plain", contactId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedContactId(contactId);
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStageId(stageId);
  };
  const onDragLeave = () => setDragOverStageId(null);
  const onDrop = (e: DragEvent<HTMLDivElement>, stageId: string) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData("text/plain");
    setDraggedContactId(null);
    setDragOverStageId(null);
    if (!contactId) return;
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;
    const currentStageId = contact.stage?.stageId || "unassigned";
    if (currentStageId === stageId) return;
    handleMoveToStage(contactId, stageId);
  };
  const onDragEnd = () => { setDraggedContactId(null); setDragOverStageId(null); };

  const renderContactCard = (contact: ContactWithStage, stageId: string) => {
    const isDragging = draggedContactId === contact.id;
    const leadSource = contact.leadSource ? LEAD_SOURCE_CONFIG[contact.leadSource] : null;
    const stageChecklistItems = stageId !== "unassigned" ? (itemsByStage[stageId] || []) : [];
    const contactStageId = contact.stage?.id;

    const completedCount = stageChecklistItems.filter(
      (item) => contactStageId && completionSet.has(`${contactStageId}:${item.id}`)
    ).length;
    const totalChecklist = stageChecklistItems.length;
    const allDone = totalChecklist > 0 && completedCount === totalChecklist;

    return (
      <div
        key={contact.id}
        draggable
        onDragStart={(e) => onDragStart(e, contact.id)}
        onDragEnd={onDragEnd}
        className={`group relative rounded-xl border bg-card shadow-sm transition-all hover:shadow-md active:cursor-grabbing ${
          isDragging ? "opacity-40 scale-95" : ""
        }`}
      >
        {/* Drag handle */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-40 transition-opacity">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-2.5 px-3 pt-3 pb-1">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
            style={{ backgroundColor: stageId !== "unassigned" ? (stages.find(s => s.id === stageId)?.color || "#94a3b8") : "#94a3b8" }}
          >
            {contact.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold leading-tight truncate cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleOpenDetail(contact)}
            >
              {contact.name}
            </p>
            {contact.phoneNumber && (
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                <Phone className="h-2.5 w-2.5" />
                {contact.phoneNumber}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleOpenDetail(contact)}>
                <User className="mr-2 h-3.5 w-3.5" /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {sortedStages.filter(s => s.id !== contact.stage?.stageId).map((stage) => (
                <DropdownMenuItem key={stage.id} onClick={() => handleMoveToStage(contact.id, stage.id)}>
                  <div className="mr-2 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                  {stage.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {contact.stage && (
                <DropdownMenuItem onClick={() => { startTransition(async () => { await removeContactFromPipeline(contact.id); router.refresh(); }); }}>
                  <X className="mr-2 h-3.5 w-3.5" /> Remover do pipeline
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteContact(contact.id)}>
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Email + Lead source */}
        <div className="px-3 pb-2 space-y-1.5">
          {contact.email && (
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground pl-10">
              <Mail className="h-2.5 w-2.5" />
              <span className="truncate">{contact.email}</span>
            </p>
          )}
          {leadSource && (
            <div className="pl-10">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${leadSource.bg} ${leadSource.text} ${leadSource.border}`}>
                {leadSource.icon} {leadSource.label}
              </span>
            </div>
          )}
        </div>

        {/* Checklist */}
        {totalChecklist > 0 && contactStageId && (
          <div className="border-t px-3 py-2 space-y-1">
            {stageChecklistItems.map((item) => {
              const isCompleted = completionSet.has(`${contactStageId}:${item.id}`);
              const ruleStage = item.moveToStageId
                ? stages.find((s) => s.id === item.moveToStageId)
                : null;
              return (
                <button
                  key={item.id}
                  onClick={() => handleToggleCheck(contactStageId, item.id, !isCompleted)}
                  className="flex items-center gap-2 w-full text-left group/check hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
                >
                  {isCompleted ? (
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover/check:text-muted-foreground" />
                  )}
                  <span className={`text-[11px] leading-tight flex-1 ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {item.label}
                  </span>
                  {ruleStage && !isCompleted && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-blue-500 shrink-0" title={`Ao marcar, mover para: ${ruleStage.name}`}>
                      <ArrowRight className="h-2.5 w-2.5" />
                      <span className="max-w-[60px] truncate">{ruleStage.name}</span>
                    </span>
                  )}
                </button>
              );
            })}
            {/* Progress bar */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${allDone ? "bg-emerald-500" : "bg-primary"}`}
                  style={{ width: `${(completedCount / totalChecklist) * 100}%` }}
                />
              </div>
              <span className={`text-[10px] font-medium ${allDone ? "text-emerald-600" : "text-muted-foreground"}`}>
                {completedCount}/{totalChecklist}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderColumn = (stageId: string, title: string, color: string, columnContacts: ContactWithStage[]) => {
    const isOver = dragOverStageId === stageId;
    const stageChecklistCount = (itemsByStage[stageId] || []).length;

    return (
      <div
        key={stageId}
        className="flex h-full w-[300px] shrink-0 flex-col"
        onDragOver={(e) => onDragOver(e, stageId)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, stageId)}
      >
        {/* Column header */}
        <div className="mb-2 rounded-xl border bg-card px-4 py-3" style={{ borderTopColor: color, borderTopWidth: "3px" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              <h3 className="text-sm font-bold">{title}</h3>
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold">
                {columnContacts.length}
              </Badge>
            </div>
            {stageChecklistCount > 0 && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Settings2 className="h-3 w-3" /> {stageChecklistCount} tarefas
              </span>
            )}
          </div>
        </div>

        {/* Cards */}
        <div
          className={`flex flex-1 flex-col gap-2.5 overflow-y-auto rounded-xl p-2 transition-colors ${
            isOver ? "bg-primary/5 ring-2 ring-primary/20" : "bg-muted/10"
          }`}
        >
          {columnContacts.length === 0 ? (
            <div className={`flex flex-1 items-center justify-center rounded-xl border-2 border-dashed p-6 text-center text-xs text-muted-foreground transition-colors ${
              isOver ? "border-primary/40 bg-primary/5" : "border-muted"
            }`}>
              {isOver ? "Soltar aqui" : "Arraste leads para cá"}
            </div>
          ) : (
            columnContacts.map((c) => renderContactCard(c, stageId))
          )}
        </div>
      </div>
    );
  };

  const totalInPipeline = contacts.filter(c => c.stage).length;
  const totalUnassigned = contacts.filter(c => !c.stage).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium">
            <span className="text-foreground">{totalInPipeline}</span>
            <span className="text-muted-foreground"> no funil</span>
          </p>
          {totalUnassigned > 0 && (
            <p className="text-sm">
              <span className="text-muted-foreground">·</span>{" "}
              <span className="text-amber-600 font-medium">{totalUnassigned}</span>
              <span className="text-muted-foreground"> sem etapa</span>
            </p>
          )}
        </div>
        <StageManagerDialog stages={stages} />
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "600px" }}>
        {contactsByStage["unassigned"]?.length > 0 &&
          renderColumn("unassigned", "Sem Etapa", "#94a3b8", contactsByStage["unassigned"])}
        {sortedStages.map((stage) =>
          renderColumn(stage.id, stage.name, stage.color, contactsByStage[stage.id] || [])
        )}
      </div>

      <ContactDetailDialog
        contact={selectedContact}
        stages={stages}
        open={detailOpen}
        onOpenChange={(v) => { setDetailOpen(v); if (!v) setSelectedContact(null); }}
      />
    </div>
  );
}
