"use client";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { upsertAiConfig } from "@/actions/upsert-ai-config";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface AgentToggleProps {
  isActive: boolean;
}

const AgentToggle = ({ isActive }: AgentToggleProps) => {
  const action = useAction(upsertAiConfig, {
    onSuccess: () => {
      toast.success(isActive ? "Agente desativado." : "Agente ativado.");
    },
    onError: () => {
      toast.error("Erro ao alterar status do agente.");
    },
  });

  const handleToggle = (checked: boolean) => {
    action.execute({
      isActive: checked,
      provider: "openai",
      model: "gpt-4o-mini",
      enableScheduling: true,
      enablePatientLookup: true,
      enableAvailabilityCheck: true,
      enableGreeting: true,
      maxTokensPerMessage: 500,
    });
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-green-600" : ""}
          >
            {isActive ? "Ativo" : "Inativo"}
          </Badge>
          <span className="font-medium">
            {isActive
              ? "Agente esta respondendo mensagens automaticamente"
              : "Agente esta desativado"}
          </span>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={handleToggle}
          disabled={action.isPending}
        />
      </CardContent>
    </Card>
  );
};

export default AgentToggle;
