"use client";

import {
  Mail,
  MoreHorizontal,
  Phone,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DragEvent, useMemo,useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteContact,
  moveContactToStage,
  removeContactFromPipeline,
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

interface KanbanBoardProps {
  stages: PipelineStage[];
  contacts: ContactWithStage[];
}

export default function KanbanBoard({ stages, contacts }: KanbanBoardProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selectedContact, setSelectedContact] = useState<ContactWithStage | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  // Group contacts by stage
  const contactsByStage = useMemo(() => {
    const map: Record<string, ContactWithStage[]> = { unassigned: [] };
    sortedStages.forEach((s) => {
      map[s.id] = [];
    });
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
        toast.success("Contato movido com sucesso");
        router.refresh();
      } catch {
        toast.error("Erro ao mover contato");
      }
    });
  };

  const handleRemoveFromPipeline = (contactId: string) => {
    startTransition(async () => {
      try {
        await removeContactFromPipeline(contactId);
        toast.success("Contato removido do pipeline");
        router.refresh();
      } catch {
        toast.error("Erro ao remover contato");
      }
    });
  };

  const handleDeleteContact = (contactId: string) => {
    startTransition(async () => {
      try {
        await deleteContact(contactId);
        toast.success("Contato excluido");
        router.refresh();
      } catch {
        toast.error("Erro ao excluir contato");
      }
    });
  };

  // Drag and drop handlers
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

  const onDragLeave = () => {
    setDragOverStageId(null);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>, stageId: string) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData("text/plain");
    setDraggedContactId(null);
    setDragOverStageId(null);

    if (!contactId) return;

    // Find the contact to check if it's already in this stage
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;

    const currentStageId = contact.stage?.stageId || "unassigned";
    if (currentStageId === stageId) return;

    handleMoveToStage(contactId, stageId);
  };

  const onDragEnd = () => {
    setDraggedContactId(null);
    setDragOverStageId(null);
  };

  const formatPhone = (phone: string) => {
    if (!phone) return "";
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const renderColumn = (
    stageId: string,
    title: string,
    color: string,
    columnContacts: ContactWithStage[],
  ) => {
    const isOver = dragOverStageId === stageId;

    return (
      <div
        key={stageId}
        className="flex h-full w-[300px] shrink-0 flex-col"
        onDragOver={(e) => onDragOver(e, stageId)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, stageId)}
      >
        {/* Column header */}
        <div
          className="mb-3 rounded-t-xl border bg-card px-4 py-3"
          style={{ borderTopColor: color, borderTopWidth: "3px" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h3 className="text-sm font-semibold">{title}</h3>
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {columnContacts.length}
              </Badge>
            </div>
          </div>
        </div>

        {/* Cards container */}
        <div
          className={`flex flex-1 flex-col gap-2 overflow-y-auto rounded-b-xl border border-t-0 p-2 transition-colors ${
            isOver ? "bg-amber-50/50 border-amber-300" : "bg-muted/20"
          }`}
        >
          {columnContacts.length === 0 ? (
            <div
              className={`flex flex-1 items-center justify-center rounded-lg border-2 border-dashed p-4 text-center text-xs text-muted-foreground transition-colors ${
                isOver ? "border-amber-400 bg-amber-50" : ""
              }`}
            >
              {isOver ? "Soltar aqui" : "Arraste contatos para ca"}
            </div>
          ) : (
            columnContacts.map((contact) => (
              <div
                key={contact.id}
                draggable
                onDragStart={(e) => onDragStart(e, contact.id)}
                onDragEnd={onDragEnd}
                className={`group cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing ${
                  draggedContactId === contact.id ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleOpenDetail(contact)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100">
                        <User className="h-3.5 w-3.5 text-amber-700" />
                      </div>
                      <p className="text-sm font-medium leading-tight line-clamp-1">
                        {contact.name}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleOpenDetail(contact)}>
                        <User className="mr-2 h-3.5 w-3.5" />
                        Ver detalhes
                      </DropdownMenuItem>
                      {sortedStages.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          {sortedStages
                            .filter((s) => s.id !== contact.stage?.stageId)
                            .map((stage) => (
                              <DropdownMenuItem
                                key={stage.id}
                                onClick={() =>
                                  handleMoveToStage(contact.id, stage.id)
                                }
                              >
                                <div
                                  className="mr-2 h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: stage.color }}
                                />
                                Mover: {stage.name}
                              </DropdownMenuItem>
                            ))}
                        </>
                      )}
                      <DropdownMenuSeparator />
                      {contact.stage && (
                        <DropdownMenuItem
                          onClick={() => handleRemoveFromPipeline(contact.id)}
                        >
                          <X className="mr-2 h-3.5 w-3.5" />
                          Remover do pipeline
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteContact(contact.id)}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Excluir contato
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div
                  className="mt-2 cursor-pointer space-y-1 pl-9"
                  onClick={() => handleOpenDetail(contact)}
                >
                  {contact.phoneNumber && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{formatPhone(contact.phoneNumber)}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {contacts.length} contato{contacts.length !== 1 ? "s" : ""} no pipeline
        </p>
        <StageManagerDialog stages={stages} />
      </div>

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "500px" }}>
        {/* Unassigned column */}
        {renderColumn(
          "unassigned",
          "Sem etapa",
          "#94a3b8",
          contactsByStage["unassigned"] || [],
        )}

        {/* Stage columns */}
        {sortedStages.map((stage) =>
          renderColumn(
            stage.id,
            stage.name,
            stage.color,
            contactsByStage[stage.id] || [],
          ),
        )}
      </div>

      {/* Contact detail dialog */}
      <ContactDetailDialog
        contact={selectedContact}
        stages={stages}
        open={detailOpen}
        onOpenChange={(v) => {
          setDetailOpen(v);
          if (!v) setSelectedContact(null);
        }}
      />
    </div>
  );
}
