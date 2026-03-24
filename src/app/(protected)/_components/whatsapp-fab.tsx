"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getWhatsappUnreadCount } from "@/actions/get-whatsapp-status";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickConversation {
  id: string;
  contactName: string | null;
  remotePhone: string;
  lastMessageContent: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  isRead: boolean;
}

export function WhatsAppFab() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState<QuickConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isWhatsAppPage = pathname?.startsWith("/whatsapp");

  // Poll unread count
  const fetchUnread = useCallback(async () => {
    try {
      const count = await getWhatsappUnreadCount();
      setUnreadCount(count);
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnread();
    intervalRef.current = setInterval(fetchUnread, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchUnread]);

  // Fetch conversations when opening
  const handleOpen = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/quick-conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch {
      toast.error("Erro ao carregar conversas");
    } finally {
      setLoading(false);
    }
  };

  // Don't render on WhatsApp page
  if (isWhatsAppPage) return null;

  const handleGoToChat = (convId?: string) => {
    setIsOpen(false);
    if (convId) {
      router.push(`/whatsapp?conv=${convId}`);
    } else {
      router.push("/whatsapp");
    }
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `${diffMins}min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Quick chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[500px] rounded-2xl border bg-white shadow-luxury-lg overflow-hidden animate-scale-in">
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ background: "linear-gradient(135deg, #D08C32, #D3AB32)" }}
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-white" />
              <div>
                <h3 className="text-sm font-bold text-white">WhatsApp</h3>
                <p className="text-[11px] text-white/70">
                  {unreadCount > 0
                    ? `${unreadCount} mensagen${unreadCount > 1 ? "s" : ""} não lida${unreadCount > 1 ? "s" : ""}`
                    : "Todas as mensagens lidas"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Conversations list */}
          <div className="max-h-[350px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D08C32] border-t-transparent" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Nenhuma conversa recente
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleGoToChat(conv.id)}
                  className={cn(
                    "flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/50",
                    !conv.isRead && "bg-amber-50/50"
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D08C32] to-[#D3AB32] text-white text-sm font-bold">
                    {(conv.contactName || conv.remotePhone)?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm truncate", !conv.isRead ? "font-bold" : "font-medium")}>
                        {conv.contactName || conv.remotePhone}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={cn("text-xs truncate", !conv.isRead ? "text-foreground" : "text-muted-foreground")}>
                        {conv.lastMessageContent || "..."}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#D08C32] px-1.5 text-[10px] font-bold text-white">
                          {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-3">
            <Button
              onClick={() => handleGoToChat()}
              className="w-full bg-[#D08C32] hover:bg-[#C47A28] text-white"
              size="sm"
            >
              <Send className="mr-2 h-4 w-4" />
              Abrir WhatsApp completo
            </Button>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95",
          isOpen
            ? "bg-[#261C10] text-white"
            : "bg-gradient-to-br from-[#D08C32] to-[#D3AB32] text-white hover:shadow-xl"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white ring-2 ring-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
