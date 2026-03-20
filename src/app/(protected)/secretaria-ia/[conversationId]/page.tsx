import dayjs from "dayjs";
import { ArrowLeftIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAiConversation } from "@/data/get-ai-data";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

interface Props {
  params: Promise<{ conversationId: string }>;
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

const ConversationDetailPage = async ({ params }: Props) => {
  const { conversationId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const clinicId = session!.user.clinic!.id;

  const conversation = await getAiConversation({ clinicId, conversationId });

  if (!conversation) notFound();

  return (
    <WithAuthentication mustHaveClinic>
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/secretaria-ia">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">
              {conversation.patient?.name || conversation.phoneNumber}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {conversation.phoneNumber}
              </span>
              <Badge
                variant="outline"
                className={statusColors[conversation.status] || ""}
              >
                {statusLabels[conversation.status] || conversation.status}
              </Badge>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mensagens</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {conversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "assistant"
                        ? "justify-end"
                        : msg.role === "system"
                          ? "justify-center"
                          : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === "assistant"
                          ? "bg-primary text-primary-foreground"
                          : msg.role === "system"
                            ? "bg-muted text-xs italic text-muted-foreground"
                            : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="mt-1 text-xs opacity-70">
                        {dayjs(msg.createdAt).format("DD/MM HH:mm")}
                        {msg.tokensUsed ? ` · ${msg.tokensUsed} tokens` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </WithAuthentication>
  );
};

export default ConversationDetailPage;
