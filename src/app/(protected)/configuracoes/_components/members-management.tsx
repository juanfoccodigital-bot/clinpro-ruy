"use client";

import { Loader2, MoreHorizontal, Plus, Trash2, UserPlus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { inviteMember } from "@/actions/invite-member";
import { removeMember } from "@/actions/remove-member";
import { revokeInvitation } from "@/actions/revoke-invitation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Member {
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
}

interface MembersManagementProps {
  members: Member[];
  invitations: Invitation[];
  currentUserId: string;
  userRole: string;
}

const roleLabels: Record<string, string> = {
  owner: "Proprietario",
  admin: "Administrador",
  member: "Membro",
  viewer: "Visualizador",
};

const roleBadgeClasses: Record<string, string> = {
  owner: "bg-amber-100 text-amber-800 border-amber-200",
  admin: "bg-blue-100 text-blue-800 border-blue-200",
  member: "bg-green-100 text-green-800 border-green-200",
  viewer: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceito",
  rejected: "Rejeitado",
  expired: "Expirado",
};

export default function MembersManagement({
  members,
  invitations,
  currentUserId,
  userRole,
}: MembersManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member" | "viewer">("member");

  const canManage = userRole === "owner" || userRole === "admin";

  const inviteAction = useAction(inviteMember, {
    onSuccess: ({ data }) => {
      toast.success("Convite enviado com sucesso!");
      if (data?.token) {
        const inviteUrl = `${window.location.origin}/convite/${data.token}`;
        navigator.clipboard.writeText(inviteUrl);
        toast.info("Link do convite copiado para a area de transferencia!");
      }
      setDialogOpen(false);
      setEmail("");
      setRole("member");
    },
    onError: (error) => {
      toast.error(error.error.serverError ?? "Erro ao enviar convite");
    },
  });

  const removeAction = useAction(removeMember, {
    onSuccess: () => {
      toast.success("Membro removido com sucesso!");
    },
    onError: (error) => {
      toast.error(error.error.serverError ?? "Erro ao remover membro");
    },
  });

  const revokeAction = useAction(revokeInvitation, {
    onSuccess: () => {
      toast.success("Convite revogado!");
    },
  });

  const handleInvite = () => {
    inviteAction.execute({ email, role });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Membros da Equipe</CardTitle>
              <CardDescription>
                Gerencie quem tem acesso ao sistema da clinica
              </CardDescription>
            </div>
            {canManage && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Convidar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Convidar Membro</DialogTitle>
                    <DialogDescription>
                      Envie um convite para adicionar um novo membro a equipe
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Funcao</Label>
                      <Select value={role} onValueChange={(v) => setRole(v as "admin" | "member" | "viewer")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador - Acesso completo</SelectItem>
                          <SelectItem value="member">Membro - Acesso parcial</SelectItem>
                          <SelectItem value="viewer">Visualizador - Somente leitura</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleInvite} disabled={inviteAction.isExecuting || !email}>
                      {inviteAction.isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Enviar Convite
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between rounded-xl border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {getInitials(member.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {member.user.name}
                      {member.userId === currentUserId && (
                        <span className="ml-2 text-xs text-muted-foreground">(Voce)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={roleBadgeClasses[member.role] ?? ""}>
                    {roleLabels[member.role] ?? member.role}
                  </Badge>
                  {canManage && member.userId !== currentUserId && member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => removeAction.execute({ userId: member.userId })}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Convites Pendentes</CardTitle>
            <CardDescription>Convites aguardando aceitacao</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        <Plus className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{invitation.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {statusLabels[invitation.status]} - Expira em{" "}
                        {new Intl.DateTimeFormat("pt-BR").format(new Date(invitation.expiresAt))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={roleBadgeClasses[invitation.role] ?? ""}>
                      {roleLabels[invitation.role] ?? invitation.role}
                    </Badge>
                    {canManage && invitation.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => revokeAction.execute({ invitationId: invitation.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
