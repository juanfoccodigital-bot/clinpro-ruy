"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Kanban,
  List,
  MoreHorizontal,
  Phone,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ContactWithStage, PipelineStage } from "./contact-detail-dialog";
import ContactDetailDialog from "./contact-detail-dialog";
import { ContactRow } from "./contacts-table-columns";
import KanbanBoard from "./kanban-board";

interface ChecklistItem {
  id: string;
  stageId: string;
  label: string;
  order: number;
  moveToStageId?: string | null;
}

interface CrmViewToggleProps {
  contacts: ContactRow[];
  stages: PipelineStage[];
  contactsWithStages: ContactWithStage[];
  checklistData?: {
    stageItems: ChecklistItem[];
    contactChecklist: { id: string; contactStageId: string; checklistItemId: string; completed: boolean }[];
  };
  totalCount: number;
  currentPage: number;
  totalPages: number;
  search: string;
  view: string;
}

const LEAD_SOURCE_CONFIG: Record<string, { label: string; icon: string; bg: string; text: string }> = {
  facebook: { label: "Facebook", icon: "📘", bg: "bg-blue-50", text: "text-blue-700" },
  instagram: { label: "Instagram", icon: "📸", bg: "bg-pink-50", text: "text-pink-700" },
  indicacao: { label: "Indicação", icon: "👤", bg: "bg-green-50", text: "text-green-700" },
  google: { label: "Google", icon: "🔍", bg: "bg-orange-50", text: "text-orange-700" },
  site: { label: "Site", icon: "🌐", bg: "bg-gray-50", text: "text-gray-700" },
  outro: { label: "Outro", icon: "📌", bg: "bg-amber-50", text: "text-amber-700" },
};

export default function CrmViewToggle({
  contacts: _contacts,
  stages,
  contactsWithStages,
  checklistData,
  totalCount,
  currentPage,
  totalPages,
  search,
  view,
}: CrmViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [, startTransition] = useTransition();
  const [selectedContact, setSelectedContact] = useState<ContactWithStage | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  // Index checklist data
  const itemsByStage = checklistData?.stageItems.reduce((acc, item) => {
    if (!acc[item.stageId]) acc[item.stageId] = [];
    acc[item.stageId].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>) || {};

  const completionSet = new Set(
    checklistData?.contactChecklist
      .filter(cc => cc.completed)
      .map(cc => `${cc.contactStageId}:${cc.checklistItemId}`) || []
  );

  const createQueryString = useCallback(
    (params: Record<string, string | undefined>) => {
      const current = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === "") current.delete(key);
        else current.set(key, value);
      }
      return current.toString();
    },
    [searchParams],
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const qs = createQueryString({ search: value || undefined, page: undefined });
      router.push(`/crm${qs ? `?${qs}` : ""}`);
    }, 400);
  };

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleViewChange = (newView: string) => {
    const qs = createQueryString({ view: newView, page: undefined });
    router.push(`/crm${qs ? `?${qs}` : ""}`);
  };

  const handlePageChange = (newPage: number) => {
    const qs = createQueryString({ page: newPage > 1 ? String(newPage) : undefined });
    router.push(`/crm${qs ? `?${qs}` : ""}`);
  };

  const handleMoveToStage = (contactId: string, stageId: string) => {
    startTransition(async () => {
      try {
        if (stageId === "remove") await removeContactFromPipeline(contactId);
        else await moveContactToStage({ patientId: contactId, stageId });
        toast.success("Contato movido");
        router.refresh();
      } catch { toast.error("Erro ao mover"); }
    });
  };

  const handleDelete = (contactId: string) => {
    startTransition(async () => {
      try {
        await deleteContact(contactId);
        toast.success("Contato excluído");
        router.refresh();
      } catch { toast.error("Erro ao excluir"); }
    });
  };

  const handleToggleCheck = (contactStageId: string, checklistItemId: string, completed: boolean) => {
    startTransition(async () => {
      try {
        const result = await toggleContactChecklist({ contactStageId, checklistItemId, completed });
        if (result?.autoMoved) toast.success(`Checklist completo! Movido para "${result.newStageName}"`);
        router.refresh();
      } catch { toast.error("Erro ao atualizar"); }
    });
  };

  const activeView = view === "lista" ? "lista" : "kanban";

  const renderListView = () => {
    return (
      <div className="space-y-2">
        {/* Stage filter pills */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="text-xs text-muted-foreground font-medium">Etapas:</span>
          {sortedStages.map(stage => {
            const count = contactsWithStages.filter(c => c.stage?.stageId === stage.id).length;
            return (
              <button
                key={stage.id}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors hover:bg-muted"
              >
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
                {stage.name}
                <span className="text-muted-foreground">({count})</span>
              </button>
            );
          })}
        </div>

        {/* List items */}
        <div className="rounded-2xl border bg-card shadow-luxury overflow-hidden">
          {contactsWithStages.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <User className="mx-auto h-8 w-8 mb-2 opacity-40" />
              <p>Nenhum contato encontrado</p>
            </div>
          ) : (
            contactsWithStages.map((contact, i) => {
              const stage = contact.stage ? sortedStages.find(s => s.id === contact.stage?.stageId) : null;
              const stageChecklistItems = stage ? (itemsByStage[stage.id] || []).sort((a, b) => a.order - b.order) : [];
              const contactStageId = contact.stage?.id;
              const completedCount = stageChecklistItems.filter(item =>
                contactStageId && completionSet.has(`${contactStageId}:${item.id}`)
              ).length;
              const leadSource = contact.leadSource ? LEAD_SOURCE_CONFIG[contact.leadSource] : null;

              return (
                <div
                  key={contact.id}
                  className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/30 ${i > 0 ? "border-t" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold mt-0.5"
                    style={{ backgroundColor: stage?.color || "#94a3b8" }}
                  >
                    {contact.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors"
                        onClick={() => { setSelectedContact(contact); setDetailOpen(true); }}
                      >
                        {contact.name}
                      </span>
                      {stage && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-2 py-0 h-5 font-medium"
                          style={{ borderColor: stage.color, color: stage.color }}
                        >
                          {stage.name}
                        </Badge>
                      )}
                      {!stage && (
                        <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5">
                          Sem etapa
                        </Badge>
                      )}
                      {leadSource && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 ${leadSource.bg} ${leadSource.text}`}>
                          {leadSource.icon} {leadSource.label}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {contact.phoneNumber && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {contact.phoneNumber}
                        </span>
                      )}
                    </div>

                    {/* Inline checklist */}
                    {stageChecklistItems.length > 0 && contactStageId && (
                      <div className="flex items-center gap-3 flex-wrap mt-1">
                        {stageChecklistItems.map(item => {
                          const isCompleted = completionSet.has(`${contactStageId}:${item.id}`);
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleToggleCheck(contactStageId, item.id, !isCompleted)}
                              className="inline-flex items-center gap-1.5 text-[11px] hover:bg-muted rounded-md px-1.5 py-0.5 transition-colors"
                            >
                              {isCompleted ? (
                                <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500">
                                  <Check className="h-2 w-2 text-white" />
                                </div>
                              ) : (
                                <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />
                              )}
                              <span className={isCompleted ? "text-muted-foreground line-through" : ""}>
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                        <span className="text-[10px] text-muted-foreground ml-1">
                          {completedCount}/{stageChecklistItems.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => { setSelectedContact(contact); setDetailOpen(true); }}>
                        <User className="mr-2 h-3.5 w-3.5" /> Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {sortedStages.filter(s => s.id !== contact.stage?.stageId).map(s => (
                        <DropdownMenuItem key={s.id} onClick={() => handleMoveToStage(contact.id, s.id)}>
                          <div className="mr-2 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                          {s.name}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      {contact.stage && (
                        <DropdownMenuItem onClick={() => handleMoveToStage(contact.id, "remove")}>
                          Remover do pipeline
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(contact.id)}>
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, totalCount)} de {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
              <span className="text-sm text-muted-foreground">{currentPage}/{totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
                Próxima <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search + View toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={activeView} onValueChange={handleViewChange}>
          <TabsList className="h-9">
            <TabsTrigger value="kanban" className="gap-1.5 text-xs px-3">
              <Kanban className="h-3.5 w-3.5" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="lista" className="gap-1.5 text-xs px-3">
              <List className="h-3.5 w-3.5" />
              Lista
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Views */}
      {activeView === "kanban" ? (
        <KanbanBoard stages={stages} contacts={contactsWithStages} checklistData={checklistData} />
      ) : (
        renderListView()
      )}

      {/* Contact detail dialog */}
      <ContactDetailDialog
        contact={selectedContact}
        stages={stages}
        open={detailOpen}
        onOpenChange={(v) => { setDetailOpen(v); if (!v) setSelectedContact(null); }}
      />
    </div>
  );
}
