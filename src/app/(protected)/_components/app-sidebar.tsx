"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  Contact,
  DollarSign,
  FileText,
  Gem,
  Headphones,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageCircle,
  Package,
  Settings,
  Shield,
  Stethoscope,
  TrendingUp,
  UserCog,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getTerminology } from "@/config/clinic-types";
import { canAccessRoute } from "@/config/plans";
import { authClient } from "@/lib/auth-client";

interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
  matchFn?: (pathname: string) => boolean;
}

interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

function buildSections(clinicType?: string | null): SidebarSection[] {
  const terms = getTerminology(clinicType);
  return [
    {
      label: "Dashboard",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "Atendimento",
      items: [
        { title: terms.appointments, url: "/appointments", icon: CalendarDays },
        { title: "Procedimentos", url: "/procedimentos", icon: ClipboardList },
        { title: "Agenda", url: "/agenda", icon: CalendarRange },
        { title: "WhatsApp", url: "/whatsapp", icon: MessageCircle },
      ],
    },
    {
      label: "CRM",
      items: [
        { title: "Contatos", url: "/crm", icon: Contact },
      ],
    },
    {
      label: terms.patients,
      items: [
        { title: terms.patients, url: "/patients", icon: UsersRound },
        {
          title: terms.medicalRecords,
          url: "/patients",
          icon: ClipboardList,
          matchFn: (p) => p.startsWith("/patients/") && p !== "/patients",
        },
        { title: "Documentos", url: "/documents", icon: FileText },
      ],
    },
    {
      label: "Agente IA",
      items: [
        { title: "Secretar.IA", url: "/secretaria-ia", icon: Bot },
      ],
    },
    {
      label: "Financeiro",
      items: [
        { title: "Financeiro", url: "/financeiro", icon: DollarSign },
      ],
    },
    {
      label: "Marketing",
      items: [
        { title: "Trafego Pago", url: "/marketing/trafego", icon: TrendingUp },
        { title: "Campanhas", url: "/marketing/campanhas", icon: Megaphone },
      ],
    },
    {
      label: "Operacional",
      items: [
        { title: terms.professionals, url: "/doctors", icon: Stethoscope },
        { title: "Funcionarios", url: "/funcionarios", icon: UserCog },
        { title: "Estoque", url: "/estoque", icon: Package },
      ],
    },
    {
      label: "Suporte",
      items: [
        { title: "Suporte", url: "/suporte", icon: Headphones },
      ],
    },
    {
      label: "Mais",
      items: [
        { title: "Relatorios", url: "/relatorios", icon: BarChart3 },
        { title: "Configuracoes", url: "/configuracoes", icon: Settings },
        { title: "Assinatura", url: "/subscription", icon: Gem },
        { title: "LGPD", url: "/configuracoes/lgpd", icon: Shield },
      ],
    },
  ];
}

export function AppSidebar() {
  const router = useRouter();
  const session = authClient.useSession();
  const pathname = usePathname();

  const clinicData = (session.data?.user as Record<string, unknown>)?.clinic as Record<string, unknown> | undefined;
  const clinicPlan = clinicData?.plan as string | undefined;
  const clinicLogoUrl = clinicData?.logoUrl as string | undefined;
  const clinicType = clinicData?.clinicType as string | undefined;

  const filteredSections = useMemo(() => {
    return buildSections(clinicType)
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => canAccessRoute(clinicPlan, item.url)),
      }))
      .filter((section) => section.items.length > 0);
  }, [clinicPlan, clinicType]);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/authentication");
        },
      },
    });
  };

  const clinicName = session.data?.user?.clinic?.name ?? "";
  const clinicInitials = clinicName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CL";

  const isActive = (item: SidebarItem) => {
    if (item.matchFn) return item.matchFn(pathname);
    return pathname === item.url || pathname.startsWith(item.url + "/");
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          {clinicLogoUrl ? (
            <div className="relative h-7 w-28">
              <Image src={clinicLogoUrl} alt={clinicName} fill className="object-contain object-left" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Image src="/logo-icon.png" alt="Clinpro" width={28} height={28} />
              <span className="text-sm font-bold text-gradient">{clinicName || "Clinpro"}</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {filteredSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title + item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item)}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="hover:bg-sidebar-accent transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {clinicInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium leading-tight">
                      {clinicName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {session.data?.user.email}
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/configuracoes" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configuracoes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/subscription" className="flex items-center gap-2">
                    <Gem className="h-4 w-4" />
                    Assinatura
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
