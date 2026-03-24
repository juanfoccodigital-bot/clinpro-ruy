"use client";

import { Pen, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface SignatureSettingsProps {
  connectionId: string;
  initialText: string | null;
  initialEnabled: boolean;
}

export default function SignatureSettings({
  connectionId,
  initialText,
  initialEnabled,
}: SignatureSettingsProps) {
  const [text, setText] = useState(initialText || "");
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/whatsapp/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connectionId, signatureText: text, signatureEnabled: enabled }),
        });
        if (!res.ok) throw new Error("Erro");
        toast.success("Assinatura salva");
      } catch {
        toast.error("Erro ao salvar assinatura");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D08C32]/10">
            <Pen className="h-5 w-5 text-[#D08C32]" />
          </div>
          <div>
            <CardTitle className="text-base">Assinatura</CardTitle>
            <CardDescription>
              Texto adicionado automaticamente no final de cada mensagem enviada
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Ativar assinatura</span>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Texto da assinatura</label>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex: Dr. Ruy"
            disabled={!enabled}
          />
          <p className="text-xs text-muted-foreground">
            Aparecerá em negrito no final da mensagem: <strong>*{text || "Dr. Ruy"}*</strong>
          </p>
        </div>

        {/* Preview */}
        {enabled && text && (
          <div className="rounded-xl bg-muted/50 p-4 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Preview da mensagem:</p>
            <div className="rounded-lg bg-emerald-100 p-3 text-sm max-w-[280px]">
              <p>Olá! Seu agendamento está confirmado para amanhã às 14h.</p>
              <p className="mt-2 font-semibold">*{text}*</p>
            </div>
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-[#D08C32] hover:bg-[#C47A28] text-white"
        >
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Salvando..." : "Salvar assinatura"}
        </Button>
      </CardContent>
    </Card>
  );
}
