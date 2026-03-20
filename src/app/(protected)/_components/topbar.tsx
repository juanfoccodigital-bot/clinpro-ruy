"use client";

import { Bell, MessageCircle, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getWhatsappStatus } from "@/actions/get-whatsapp-status";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";

export function Topbar() {
  const session = authClient.useSession();
  const [whatsappStatus, setWhatsappStatus] = useState<
    "connected" | "disconnected" | null
  >(null);

  useEffect(() => {
    getWhatsappStatus().then(setWhatsappStatus);
  }, []);

  const userName = session.data?.user?.name || "Usuário";
  const userInitials =
    userName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "US";

  return (
    <TooltipProvider delayDuration={200}>
      <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 backdrop-blur-md">
        <SidebarTrigger />

        <div className="flex items-center gap-1">
          {/* WhatsApp Status */}
          {whatsappStatus !== null && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" asChild>
                  <Link href="/whatsapp">
                    <MessageCircle className="h-[18px] w-[18px]" />
                    <span
                      className={`absolute right-2 top-2 h-2 w-2 rounded-full ring-2 ring-background ${
                        whatsappStatus === "connected"
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }`}
                    />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {whatsappStatus === "connected"
                  ? "WhatsApp conectado"
                  : "WhatsApp desconectado"}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-[18px] w-[18px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notificações</TooltipContent>
          </Tooltip>

          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/configuracoes/lgpd">
                  <Settings className="h-[18px] w-[18px]" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Configurações</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mx-2 h-6" />

          {/* User */}
          <div className="flex items-center gap-2.5 pl-1">
            <Avatar className="h-8 w-8 ring-2 ring-primary/10">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden flex-col md:flex">
              <span className="text-sm font-semibold leading-tight">{userName}</span>
              <span className="text-muted-foreground text-xs">
                {session.data?.user?.clinic?.name}
              </span>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
