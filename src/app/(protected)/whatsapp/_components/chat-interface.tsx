"use client";

import dayjs from "dayjs";
import { SendIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { sendWhatsappMessage } from "@/actions/send-whatsapp-message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Conversation {
  phone: string;
  patientName: string | null;
  lastMessage: {
    content: string | null;
    createdAt: Date;
    direction: string;
  };
  messageCount: number;
}

interface Connection {
  id: string;
  instanceName: string;
  phoneNumber: string | null;
  status: string;
}

interface QuickReply {
  id: string;
  shortcut: string;
  content: string;
}

interface ChatInterfaceProps {
  connections: Connection[];
  conversations: Conversation[];
  quickReplies: QuickReply[];
}

const ChatInterface = ({
  connections,
  conversations,
  quickReplies,
}: ChatInterfaceProps) => {
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [newPhoneInput, setNewPhoneInput] = useState("");

  const activeConnection = connections[0];

  const sendAction = useAction(sendWhatsappMessage, {
    onSuccess: () => {
      setMessageInput("");
      toast.success("Mensagem enviada com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao enviar mensagem.");
    },
  });

  const handleSend = () => {
    if (!messageInput.trim() || !selectedPhone || !activeConnection) return;
    sendAction.execute({
      connectionId: activeConnection.id,
      remotePhone: selectedPhone,
      content: messageInput,
    });
  };

  const handleNewConversation = () => {
    if (!newPhoneInput.trim()) return;
    setSelectedPhone(newPhoneInput.trim());
    setNewPhoneInput("");
  };

  const handleQuickReply = (content: string) => {
    setMessageInput(content);
  };

  const selectedConversation = conversations.find(
    (c) => c.phone === selectedPhone,
  );

  return (
    <div className="flex h-[600px] gap-4">
      {/* Painel esquerdo - lista de conversas */}
      <Card className="flex w-80 flex-col">
        <div className="border-b p-3">
          <div className="flex gap-2">
            <Input
              placeholder="Novo numero..."
              value={newPhoneInput}
              onChange={(e) => setNewPhoneInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNewConversation()}
            />
            <Button size="sm" onClick={handleNewConversation}>
              Iniciar
            </Button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge
              variant={
                activeConnection?.status === "connected"
                  ? "default"
                  : "secondary"
              }
            >
              {activeConnection?.status === "connected"
                ? "Conectado"
                : "Desconectado"}
            </Badge>
            <span className="text-muted-foreground text-xs">
              {activeConnection?.instanceName}
            </span>
          </div>
        </div>
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground text-sm">
                Nenhuma conversa encontrada.
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.phone}
                className={`cursor-pointer border-b p-3 hover:bg-muted/50 ${
                  selectedPhone === conv.phone ? "bg-muted" : ""
                }`}
                onClick={() => setSelectedPhone(conv.phone)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {(conv.patientName || conv.phone)[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium">
                        {conv.patientName || conv.phone}
                      </p>
                      <span className="text-muted-foreground text-xs">
                        {dayjs(conv.lastMessage.createdAt).format("HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground truncate text-xs">
                        {conv.lastMessage.content || "Midia"}
                      </p>
                      {conv.messageCount > 0 && (
                        <Badge
                          variant="default"
                          className="ml-1 h-5 min-w-5 justify-center rounded-full px-1 text-xs"
                        >
                          {conv.messageCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </Card>

      {/* Painel direito - mensagens */}
      <Card className="flex flex-1 flex-col">
        {selectedPhone ? (
          <>
            <div className="flex items-center gap-3 border-b p-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {(selectedConversation?.patientName || selectedPhone)[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {selectedConversation?.patientName || selectedPhone}
                </p>
                <p className="text-muted-foreground text-xs">
                  {selectedPhone}
                </p>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <p className="text-muted-foreground text-center text-sm">
                Selecione uma conversa para ver as mensagens. As mensagens serao
                carregadas em tempo real.
              </p>
            </ScrollArea>
            <div className="border-t p-3">
              {quickReplies.length > 0 && (
                <div className="mb-2 flex gap-1 overflow-x-auto">
                  {quickReplies.map((qr) => (
                    <Button
                      key={qr.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(qr.content)}
                    >
                      /{qr.shortcut}
                    </Button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Digite uma mensagem..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button
                  onClick={handleSend}
                  disabled={sendAction.isPending || !messageInput.trim()}
                >
                  <SendIcon className="h-4 w-4" />
                  Enviar
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground flex flex-1 items-center justify-center">
            Selecione uma conversa para comecar.
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChatInterface;
