"use client";

import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getCrmStagesForClinic,
  getPatientByPhone,
} from "@/actions/convert-whatsapp-contact";
import { moveContactToStage } from "@/actions/crm-pipeline";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CrmStageWidgetProps {
  phoneNumber: string;
}

interface StageInfo {
  id: string;
  stageId: string;
  stageName: string;
  stageColor: string;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

export default function CrmStageWidget({ phoneNumber }: CrmStageWidgetProps) {
  const router = useRouter();
  const [patientId, setPatientId] = useState<string | null>(null);
  const [crmStage, setCrmStage] = useState<StageInfo | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const patient = await getPatientByPhone(phoneNumber);
      if (patient) {
        setPatientId(patient.id);
        setCrmStage(patient.crmStage);
        const allStages = await getCrmStagesForClinic();
        setStages(allStages);
      } else {
        setPatientId(null);
        setCrmStage(null);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [phoneNumber]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const handleChangeStage = async (stageId: string) => {
    if (!patientId) return;
    setChanging(true);
    try {
      await moveContactToStage({ patientId, stageId });
      toast.success("Etapa do CRM atualizada!");
      await loadData();
      router.refresh();
    } catch {
      toast.error("Erro ao atualizar etapa.");
    } finally {
      setChanging(false);
    }
  };

  if (loading) return null;
  if (!patientId || !crmStage) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-1 outline-none" disabled={changing}>
          <Badge
            className="cursor-pointer gap-1 text-[10px] text-white hover:opacity-80"
            style={{ backgroundColor: crmStage.stageColor }}
          >
            {changing ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
            ) : null}
            {crmStage.stageName}
            <ChevronDown className="h-2.5 w-2.5" />
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Mover para etapa
        </p>
        {stages.map((stage) => (
          <DropdownMenuItem
            key={stage.id}
            onClick={() => handleChangeStage(stage.id)}
            className="gap-2"
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: stage.color }}
            />
            <span className="flex-1">{stage.name}</span>
            {crmStage.stageId === stage.id && (
              <Check className="h-3.5 w-3.5 text-[#D08C32]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
