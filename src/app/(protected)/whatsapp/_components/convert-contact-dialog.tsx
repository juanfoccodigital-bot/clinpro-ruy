"use client";

import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  convertWhatsappContact,
  getPatientByPhone,
} from "@/actions/convert-whatsapp-contact";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConvertContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName: string | null;
  phoneNumber: string;
}

export default function ConvertContactDialog({
  open,
  onOpenChange,
  contactName,
  phoneNumber,
}: ConvertContactDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [existingPatient, setExistingPatient] = useState<{
    id: string;
    name: string;
    crmStage: { stageName: string; stageColor: string } | null;
  } | null>(null);

  const [name, setName] = useState(contactName || "");
  const [email, setEmail] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "not_informed">("female");
  const [leadSource] = useState("whatsapp");
  const [leadSourceDetail, setLeadSourceDetail] = useState("");

  // Check if patient already exists when dialog opens
  useEffect(() => {
    if (open && phoneNumber) {
      setChecking(true);
      setName(contactName || "");
      getPatientByPhone(phoneNumber)
        .then((patient) => {
          if (patient) {
            setExistingPatient({
              id: patient.id,
              name: patient.name,
              crmStage: patient.crmStage
                ? { stageName: patient.crmStage.stageName, stageColor: patient.crmStage.stageColor }
                : null,
            });
          } else {
            setExistingPatient(null);
          }
        })
        .catch(() => setExistingPatient(null))
        .finally(() => setChecking(false));
    }
  }, [open, phoneNumber, contactName]);

  const handleConvert = async () => {
    if (!name.trim()) {
      toast.error("Nome e obrigatorio.");
      return;
    }

    setLoading(true);
    try {
      await convertWhatsappContact({
        phoneNumber,
        name: name.trim(),
        email: email.trim() || undefined,
        sex,
        leadSource,
        leadSourceDetail: leadSourceDetail.trim() || undefined,
      });
      toast.success("Contato convertido em paciente com sucesso!");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Erro ao converter contato.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#D08C32]" />
            Converter em Paciente
          </DialogTitle>
          <DialogDescription>
            Crie um paciente e adicione ao CRM a partir deste contato do WhatsApp.
          </DialogDescription>
        </DialogHeader>

        {checking ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#D08C32]" />
          </div>
        ) : existingPatient ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Este contato ja esta vinculado a um paciente
              </p>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                {existingPatient.name}
              </p>
              {existingPatient.crmStage && (
                <Badge
                  className="mt-2 text-white"
                  style={{ backgroundColor: existingPatient.crmStage.stageColor }}
                >
                  {existingPatient.crmStage.stageName}
                </Badge>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  router.push(`/patients?search=${phoneNumber}`);
                }}
                className="bg-gradient-to-r from-[#D08C32] to-[#D3AB32] text-white hover:opacity-90"
              >
                Ver Paciente
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conv-name">Nome *</Label>
              <Input
                id="conv-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do paciente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conv-phone">Telefone</Label>
              <Input
                id="conv-phone"
                value={phoneNumber}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conv-email">Email (opcional)</Label>
              <Input
                id="conv-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Sexo *</Label>
              <Select value={sex} onValueChange={(v) => setSex(v as "male" | "female" | "not_informed")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="male">Masculino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Origem do Lead</Label>
              <Input value="WhatsApp" disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conv-detail">Detalhe da Origem (opcional)</Label>
              <Input
                id="conv-detail"
                value={leadSourceDetail}
                onChange={(e) => setLeadSourceDetail(e.target.value)}
                placeholder="Ex: Campanha Instagram, Indicacao..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleConvert}
                disabled={loading || !name.trim()}
                className="bg-gradient-to-r from-[#D08C32] to-[#D3AB32] text-white hover:opacity-90"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Salvar como Paciente
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
