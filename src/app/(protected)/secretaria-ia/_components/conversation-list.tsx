"use client";

import dayjs from "dayjs";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Conversation {
  id: string;
  phoneNumber: string;
  status: string;
  resolvedAction: string | null;
  updatedAt: Date;
  patient: { id: string; name: string } | null;
  messages: Array<{ content: string; createdAt: Date; role: string }>;
}

interface ConversationListProps {
  conversations: Conversation[];
}

const statusLabels: Record<string, string> = {
  active: "Ativa",
  resolved: "Resolvida",
  escalated: "Escalada",
  expired: "Expirada",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  resolved: "bg-blue-100 text-blue-800",
  escalated: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
};

const ConversationList = ({ conversations }: ConversationListProps) => {
  if (conversations.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Nenhuma conversa registrada.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conv) => (
        <Link key={conv.id} href={`/secretaria-ia/${conv.id}`}>
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar>
                <AvatarFallback>
                  {(conv.patient?.name || conv.phoneNumber)[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {conv.patient?.name || conv.phoneNumber}
                  </p>
                  <Badge
                    variant="outline"
                    className={statusColors[conv.status] || ""}
                  >
                    {statusLabels[conv.status] || conv.status}
                  </Badge>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {conv.messages[0]?.content || "Sem mensagens"}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {dayjs(conv.updatedAt).format("DD/MM HH:mm")}
              </span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default ConversationList;
