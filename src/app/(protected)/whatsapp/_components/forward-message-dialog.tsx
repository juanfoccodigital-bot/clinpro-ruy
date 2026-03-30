"use client";

import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  sendWhatsappMedia,
  sendWhatsappMessage,
} from "@/actions/send-whatsapp-message";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ForwardMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: {
    content: string;
    messageType: string;
    mediaUrl: string | null;
  } | null;
  conversations: {
    id: string;
    remotePhone: string;
    contactName: string | null;
  }[];
  connectionId: string;
}

export default function ForwardMessageDialog({
  open,
  onOpenChange,
  message,
  conversations,
  connectionId,
}: ForwardMessageDialogProps) {
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState<string | null>(null);

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.contactName?.toLowerCase().includes(q) ||
      c.remotePhone.includes(q)
    );
  });

  const handleForward = async (conv: {
    remotePhone: string;
    contactName: string | null;
  }) => {
    if (!message) return;

    setSending(conv.remotePhone);
    try {
      if (
        message.mediaUrl &&
        message.messageType !== "text" &&
        message.mediaUrl.startsWith("data:")
      ) {
        // Extract base64 and mime from data URL
        const match = message.mediaUrl.match(
          /^data:([^;]+);base64,(.+)$/,
        );
        if (match) {
          const mimeType = match[1];
          const base64 = match[2];
          const mediaType = message.messageType as
            | "image"
            | "audio"
            | "video"
            | "document";
          await sendWhatsappMedia({
            connectionId,
            remotePhone: conv.remotePhone,
            mediaBase64: base64,
            mediaType,
            mimeType,
            caption: message.content || undefined,
          });
        }
      } else {
        // Text message or media without base64
        const content =
          message.content ||
          (message.messageType === "image"
            ? "[Imagem]"
            : message.messageType === "audio"
              ? "[Audio]"
              : message.messageType === "video"
                ? "[Video]"
                : message.messageType === "document"
                  ? "[Documento]"
                  : "[Midia]");
        await sendWhatsappMessage({
          connectionId,
          remotePhone: conv.remotePhone,
          content,
        });
      }

      toast.success(
        `Mensagem encaminhada para ${conv.contactName || conv.remotePhone}`,
      );
      onOpenChange(false);
      setSearch("");
    } catch {
      toast.error("Erro ao encaminhar mensagem.");
    } finally {
      setSending(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Encaminhar Mensagem</DialogTitle>
          <DialogDescription>
            Selecione uma conversa para encaminhar a mensagem.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum contato encontrado
              </p>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.id}
                  disabled={sending !== null}
                  onClick={() => handleForward(conv)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {(
                      conv.contactName || conv.remotePhone
                    )[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {conv.contactName || conv.remotePhone}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {conv.remotePhone}
                    </p>
                  </div>
                  {sending === conv.remotePhone && (
                    <Loader2 className="h-4 w-4 animate-spin text-[#D08C32]" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
