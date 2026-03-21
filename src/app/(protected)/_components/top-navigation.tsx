"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Contact,
  CreditCard,
  DollarSign,
  Headphones,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  Package,
  Receipt,
  Settings,
  Shield,
  TrendingUp,
  UserCog,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getWhatsappStatus } from "@/actions/get-whatsapp-status";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { canAccessRoute } from "@/config/plans";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  url?: string;
  icon: LucideIcon;
  items?: NavItem[];
  matchPaths?: string[];
}

const allNavGroups: NavGroup[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Atendimento",
    icon: CalendarDays,
    matchPaths: ["/appointments", "/agenda", "/whatsapp"],
    items: [
      { title: "Agenda de Procedimentos", url: "/appointments", icon: CalendarDays },
      { title: "Agenda", url: "/agenda", icon: CalendarRange },
      { title: "WhatsApp", url: "/whatsapp", icon: MessageCircle },
    ],
  },
  {
    title: "CRM",
    icon: Contact,
    matchPaths: ["/crm"],
    items: [
      { title: "Funil de Vendas", url: "/crm", icon: Contact },
      { title: "Performance", url: "/crm/dashboard", icon: BarChart3 },
    ],
  },
  {
    title: "Pacientes",
    icon: UsersRound,
    matchPaths: ["/patients"],
    items: [
      { title: "Pacientes", url: "/patients", icon: UsersRound },
      { title: "Fichas Clínicas", url: "/patients", icon: ClipboardList },
    ],
  },
  {
    title: "Agente IA",
    icon: Bot,
    matchPaths: ["/secretaria-ia"],
    items: [
      { title: "Secretar.IA", url: "/secretaria-ia", icon: Bot },
    ],
  },
  {
    title: "Financeiro",
    icon: DollarSign,
    matchPaths: ["/financeiro"],
    items: [
      { title: "Visao Geral", url: "/financeiro", icon: DollarSign },
      { title: "Transacoes", url: "/financeiro/transacoes", icon: Receipt },
      { title: "Maquininhas", url: "/financeiro/maquininhas", icon: CreditCard },
    ],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    matchPaths: ["/marketing"],
    items: [
      { title: "Trafego Pago", url: "/marketing/trafego", icon: TrendingUp },
      { title: "Campanhas", url: "/marketing/campanhas", icon: Megaphone },
    ],
  },
  {
    title: "Operacional",
    icon: Package,
    matchPaths: ["/funcionarios", "/estoque"],
    items: [
      { title: "Funcionarios", url: "/funcionarios", icon: UserCog },
      { title: "Estoque", url: "/estoque", icon: Package },
    ],
  },
  {
    title: "Suporte",
    url: "/suporte",
    icon: Headphones,
  },
  {
    title: "Mais",
    icon: BarChart3,
    matchPaths: ["/relatorios", "/configuracoes", "/subscription"],
    items: [
      { title: "Relatorios", url: "/relatorios", icon: BarChart3 },
      { title: "Pagamento", url: "/subscription", icon: DollarSign },
      { title: "Configuracoes", url: "/configuracoes", icon: Settings },
      { title: "LGPD", url: "/configuracoes/lgpd", icon: Shield },
    ],
  },
];

export function TopNavigation() {
  const session = authClient.useSession();
  const pathname = usePathname();
  const [whatsappStatus, setWhatsappStatus] = useState<
    "connected" | "disconnected" | null
  >(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWhatsappStatus().then((status) => {
      if (!cancelled) setWhatsappStatus(status);
    });
    return () => { cancelled = true; };
  }, []);

  const clinicPlan = (session.data?.user as Record<string, unknown>)?.clinic
    ? ((session.data?.user as Record<string, unknown>).clinic as Record<string, unknown>)?.plan as string | undefined
    : undefined;

  // Filter nav groups based on plan
  const navGroups = useMemo(() => {
    return allNavGroups
      .map((group) => {
        if (group.url && !group.items) {
          // Single-link group: check if route is accessible
          if (!canAccessRoute(clinicPlan, group.url)) return null;
          return group;
        }
        // Group with sub-items: filter items
        const filteredItems = group.items?.filter((item) =>
          canAccessRoute(clinicPlan, item.url),
        );
        if (!filteredItems || filteredItems.length === 0) return null;
        return {
          ...group,
          items: filteredItems,
          matchPaths: group.matchPaths?.filter((p) => canAccessRoute(clinicPlan, p)),
        };
      })
      .filter(Boolean) as NavGroup[];
  }, [clinicPlan]);

  const handleSignOut = () => {
    authClient.signOut().then(() => {
      window.location.href = "/authentication";
    }).catch(() => {
      window.location.href = "/authentication";
    });
  };

  const userName = session.data?.user?.name || "Usuario";
  const userInitials =
    userName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "US";

  const clinicName = session.data?.user?.clinic?.name ?? "";

  const isPathActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + "/");
  };

  const isGroupActive = (group: NavGroup) => {
    if (group.url) return isPathActive(group.url);
    if (group.matchPaths) {
      return group.matchPaths.some((p) => isPathActive(p));
    }
    return group.items?.some((item) => isPathActive(item.url)) ?? false;
  };

  return (
    <TooltipProvider delayDuration={200}>
      <header className="sticky top-0 z-30 border-b border-[#D08C32]/8 bg-white/70 backdrop-blur-2xl shadow-sm shadow-[#D08C32]/5 dark:bg-[#261C10]/70">
        <div className="flex h-14 items-center gap-2.5 px-4 lg:px-5">
          {/* Logo */}
          <Link href="/dashboard" className="mr-3 shrink-0 flex items-center gap-2.5 group">
            <Image src="/logoelo.png" alt="Elo Clinic" width={36} height={36} className="transition-transform duration-300 group-hover:scale-105" />
            <span className="text-sm font-bold tracking-tight hidden sm:block text-gradient">
              {clinicName || "Elo Clinic"}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {navGroups.map((group) =>
              group.url && !group.items ? (
                <Link
                  key={group.title}
                  href={group.url}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[13px] font-medium transition-all duration-300",
                    isGroupActive(group)
                      ? "bg-gradient-to-r from-[#D08C32] to-[#D3AB32] text-white shadow-sm shadow-[#D08C32]/20"
                      : "text-muted-foreground hover:bg-[#D08C32]/8 hover:text-foreground",
                  )}
                >
                  {group.title}
                </Link>
              ) : (
                <DropdownMenu key={group.title}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all duration-300 outline-none",
                        isGroupActive(group)
                          ? "bg-gradient-to-r from-[#D08C32] to-[#D3AB32] text-white shadow-sm shadow-[#D08C32]/20"
                          : "text-muted-foreground hover:bg-[#D08C32]/8 hover:text-foreground",
                      )}
                    >
                      {group.title}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-44">
                    {group.items?.map((item) => (
                      <DropdownMenuItem key={item.url + item.title} asChild>
                        <Link
                          href={item.url}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5",
                            isPathActive(item.url) && "font-semibold",
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            )}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side */}
          <div className="flex items-center gap-1">
            {/* WhatsApp Status - always visible */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9" asChild>
                  <Link href="/whatsapp">
                    <MessageCircle
                      className={cn(
                        "h-[18px] w-[18px]",
                        whatsappStatus === "connected"
                          ? "text-emerald-500"
                          : "text-red-500",
                      )}
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

            {/* Notifications */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden h-9 w-9 sm:flex">
                  <Bell className="h-[18px] w-[18px]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notificacoes</TooltipContent>
            </Tooltip>

            {/* Settings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden h-9 w-9 sm:flex" asChild>
                  <Link href="/configuracoes">
                    <Settings className="h-[18px] w-[18px]" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Configuracoes</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-2 hidden h-6 sm:block" />

            {/* User */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-muted outline-none">
                  <Avatar className="h-8 w-8 ring-2 ring-[#D08C32]/15">
                    <AvatarFallback className="bg-gradient-to-br from-[#D08C32] to-[#D3AB32] text-white text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-semibold leading-tight">{userName}</p>
                    <p className="text-muted-foreground text-xs">
                      {clinicName}
                    </p>
                  </div>
                  <ChevronDown className="hidden h-3 w-3 text-muted-foreground md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/configuracoes" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configuracoes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="border-b border-amber-500/10 p-4">
                  <SheetTitle className="flex items-center gap-2.5">
                    <Image src="/logoelo.png" alt="Elo Clinic" width={32} height={32} />
                    <span className="text-sm font-bold tracking-tight text-gradient">
                      {clinicName || "Elo Clinic"}
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-0.5 overflow-y-auto p-3">
                  {navGroups.map((group) => (
                    <div key={group.title}>
                      {group.url && !group.items ? (
                        <Link
                          href={group.url}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                            isGroupActive(group)
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <group.icon className="h-4 w-4" />
                          {group.title}
                        </Link>
                      ) : (
                        <div className="group/nav">
                          <button
                            onClick={() =>
                              setExpandedGroup(
                                expandedGroup === group.title ? null : group.title,
                              )
                            }
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                              isGroupActive(group)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <group.icon className="h-4 w-4" />
                              {group.title}
                            </span>
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 transition-transform duration-200",
                                expandedGroup === group.title && "rotate-90",
                              )}
                            />
                          </button>
                          <div
                            className={cn(
                              "overflow-hidden transition-all duration-200",
                              expandedGroup === group.title
                                ? "max-h-96 opacity-100"
                                : "max-h-0 opacity-0",
                            )}
                          >
                            <div className="ml-3 border-l border-border/50 pl-3 py-1">
                              {group.items?.map((item) => (
                                <Link
                                  key={item.url + item.title}
                                  href={item.url}
                                  onClick={() => setMobileOpen(false)}
                                  className={cn(
                                    "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                                    isPathActive(item.url)
                                      ? "bg-primary text-primary-foreground font-medium"
                                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                  )}
                                >
                                  <item.icon className="h-3.5 w-3.5" />
                                  {item.title}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* WhatsApp Status in sidebar */}
                  <Separator className="my-2" />
                  <Link
                    href="/whatsapp"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isPathActive("/whatsapp")
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <MessageCircle
                      className={cn(
                        "h-4 w-4",
                        whatsappStatus === "connected"
                          ? "text-emerald-500"
                          : "text-red-500",
                        isPathActive("/whatsapp") && "text-primary-foreground",
                      )}
                    />
                    <span>WhatsApp</span>
                    <span
                      className={cn(
                        "ml-auto h-2 w-2 rounded-full",
                        whatsappStatus === "connected"
                          ? "bg-emerald-500"
                          : "bg-red-500",
                      )}
                    />
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
