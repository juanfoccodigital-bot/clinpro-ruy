"use client";

import { Loader2, Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

interface TwoFactorSettingsProps {
  twoFactorEnabled: boolean;
}

export default function TwoFactorSettings({
  twoFactorEnabled: initialEnabled,
}: TwoFactorSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [step, setStep] = useState<
    "idle" | "password" | "qr" | "verify" | "backup"
  >("idle");
  const [password, setPassword] = useState("");
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const result = await authClient.twoFactor.enable({
        password,
      });
      if (result.error) {
        toast.error("Senha incorreta.");
        return;
      }
      setTotpURI(result.data.totpURI);
      setBackupCodes(result.data.backupCodes);
      setStep("qr");
    } catch {
      toast.error("Erro ao ativar 2FA.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const result = await authClient.twoFactor.verifyTotp({
        code: verifyCode,
      });
      if (result.error) {
        toast.error("Codigo invalido.");
        return;
      }
      setEnabled(true);
      setStep("backup");
      toast.success("Autenticacao em duas etapas ativada!");
    } catch {
      toast.error("Erro ao verificar codigo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const result = await authClient.twoFactor.disable({
        password,
      });
      if (result.error) {
        toast.error("Senha incorreta.");
        return;
      }
      setEnabled(false);
      setStep("idle");
      setPassword("");
      toast.success("Autenticacao em duas etapas desativada.");
    } catch {
      toast.error("Erro ao desativar 2FA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          Autenticacao em Duas Etapas (2FA)
        </CardTitle>
        <CardDescription>
          Adicione uma camada extra de seguranca a sua conta usando um aplicativo
          autenticador (Google Authenticator, Authy, etc).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {enabled ? (
            <>
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                Ativada
              </span>
            </>
          ) : (
            <>
              <ShieldOff className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">Desativada</span>
            </>
          )}
        </div>

        {step === "idle" && (
          <Button
            onClick={() => setStep("password")}
            variant={enabled ? "destructive" : "default"}
          >
            {enabled ? "Desativar 2FA" : "Ativar 2FA"}
          </Button>
        )}

        {step === "password" && (
          <div className="space-y-3">
            <Label>Confirme sua senha</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
            />
            <div className="flex gap-2">
              <Button
                onClick={enabled ? handleDisable : handleEnable}
                disabled={loading || !password}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setStep("idle");
                  setPassword("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {step === "qr" && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Escaneie o QR Code abaixo com seu aplicativo autenticador:
            </p>
            <div className="flex justify-center rounded-lg bg-white p-4">
              <QRCode value={totpURI} size={200} />
            </div>
            <div className="space-y-2">
              <Label>Codigo de verificacao</Label>
              <Input
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <Button
              onClick={handleVerify}
              disabled={loading || verifyCode.length !== 6}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verificar e Ativar
            </Button>
          </div>
        )}

        {step === "backup" && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-orange-600">
              Salve estes codigos de backup em um local seguro. Cada codigo so
              pode ser usado uma vez.
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-4 font-mono text-sm">
              {backupCodes.map((code, i) => (
                <span key={i}>{code}</span>
              ))}
            </div>
            <Button
              onClick={() => {
                setStep("idle");
                setPassword("");
                setVerifyCode("");
              }}
            >
              Entendi, ja salvei os codigos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
