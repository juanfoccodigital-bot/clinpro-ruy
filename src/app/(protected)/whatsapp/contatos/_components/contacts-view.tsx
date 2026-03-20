"use client";

import dayjs from "dayjs";
import {
  Edit2,
  MessageCircle,
  Phone,
  Search,
  Trash2,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteWhatsappContact } from "@/actions/delete-whatsapp-contact";
import { updateWhatsappContact } from "@/actions/update-whatsapp-contact";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";

interface Contact {
  id: string;
  name: string | null;
  phoneNumber: string;
  email: string | null;
  notes: string | null;
  patientName: string | null;
  createdAt: string;
}

interface ContactsViewProps {
  contacts: Contact[];
}

export default function ContactsView({ contacts }: ContactsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const [viewContact, setViewContact] = useState<Contact | null>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const updateAction = useAction(updateWhatsappContact, {
    onSuccess: () => {
      toast.success("Contato atualizado.");
      setEditContact(null);
    },
    onError: () => {
      toast.error("Erro ao atualizar contato.");
    },
  });

  const deleteAction = useAction(deleteWhatsappContact, {
    onSuccess: () => {
      toast.success("Contato excluido.");
      setDeleteContactId(null);
    },
    onError: () => {
      toast.error("Erro ao excluir contato.");
    },
  });

  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phoneNumber.includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  const openEdit = (contact: Contact) => {
    setEditName(contact.name || "");
    setEditPhone(contact.phoneNumber);
    setEditEmail(contact.email || "");
    setEditNotes(contact.notes || "");
    setEditContact(contact);
  };

  const handleSaveEdit = () => {
    if (!editContact) return;
    updateAction.execute({
      contactId: editContact.id,
      name: editName || undefined,
      phoneNumber: editPhone || undefined,
      email: editEmail || null,
      notes: editNotes || null,
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-background px-6 py-3">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Contatos WhatsApp</h1>
          <Badge variant="secondary">{contacts.length}</Badge>
        </div>
        <Link href="/whatsapp">
          <Button variant="outline" size="sm">
            <MessageCircle className="mr-1.5 h-4 w-4" />
            Voltar ao Chat
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="border-b bg-background px-6 py-3">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Nenhum contato encontrado"
                : "Nenhum contato ainda"}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-muted/50"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-sm text-primary">
                    {(contact.name && contact.name !== contact.phoneNumber
                      ? contact.name
                      : "?"
                    )[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => setViewContact(contact)}
                >
                  <p className="truncate text-sm font-medium">
                    {contact.name && contact.name !== contact.phoneNumber
                      ? contact.name
                      : "Sem nome"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <Phone className="mr-1 inline h-3 w-3" />
                    {formatPhone(contact.phoneNumber)}
                  </p>
                </div>

                {contact.email && (
                  <span className="hidden text-xs text-muted-foreground md:block">
                    {contact.email}
                  </span>
                )}

                {contact.patientName && (
                  <Badge variant="outline" className="hidden text-xs lg:flex">
                    <User className="mr-1 h-3 w-3" />
                    {contact.patientName}
                  </Badge>
                )}

                <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                  {dayjs(contact.createdAt).format("DD/MM/YY")}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(contact)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteContactId(contact.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Contact Dialog */}
      <Dialog
        open={!!viewContact}
        onOpenChange={(open) => !open && setViewContact(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Detalhes do Contato
            </DialogTitle>
          </DialogHeader>
          {viewContact && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/10 text-lg text-primary">
                    {(viewContact.name && viewContact.name !== viewContact.phoneNumber
                      ? viewContact.name
                      : "?"
                    )[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">
                    {viewContact.name && viewContact.name !== viewContact.phoneNumber
                      ? viewContact.name
                      : "Sem nome"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatPhone(viewContact.phoneNumber)}
                  </p>
                </div>
              </div>

              {viewContact.email && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-sm">{viewContact.email}</p>
                </div>
              )}

              {viewContact.notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Observacoes
                  </p>
                  <p className="whitespace-pre-wrap text-sm">
                    {viewContact.notes}
                  </p>
                </div>
              )}

              {viewContact.patientName && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Paciente vinculado
                  </p>
                  <p className="text-sm">{viewContact.patientName}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Criado em
                </p>
                <p className="text-sm">
                  {dayjs(viewContact.createdAt).format(
                    "DD/MM/YYYY [as] HH:mm",
                  )}
                </p>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewContact(null);
                    openEdit(viewContact);
                  }}
                >
                  <Edit2 className="mr-1.5 h-4 w-4" />
                  Editar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog
        open={!!editContact}
        onOpenChange={(open) => !open && setEditContact(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Contato</DialogTitle>
            <DialogDescription>
              Atualize as informacoes do contato.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome do contato"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="5511999999999"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Observacoes</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Anotacoes sobre o contato..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditContact(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateAction.isPending}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteContactId}
        onOpenChange={(open) => !open && setDeleteContactId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir contato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao nao pode ser desfeita. O contato sera removido
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteContactId) {
                  deleteAction.execute({ contactId: deleteContactId });
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function formatPhone(phone: string): string {
  if (phone.length === 13) {
    return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`;
  }
  if (phone.length === 12) {
    return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 8)}-${phone.slice(8)}`;
  }
  return phone;
}
