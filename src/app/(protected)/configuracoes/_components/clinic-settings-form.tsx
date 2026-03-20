"use client";

import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useAction } from "next-safe-action/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { updateClinicSettings } from "@/actions/update-clinic-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClinicSettingsFormProps {
  clinic: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
}

export default function ClinicSettingsForm({ clinic }: ClinicSettingsFormProps) {
  const [name, setName] = useState(clinic.name);
  const [logoUrl, setLogoUrl] = useState<string | null>(clinic.logoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateAction = useAction(updateClinicSettings, {
    onSuccess: () => {
      toast.success("Configuracoes salvas com sucesso!");
    },
    onError: (error) => {
      toast.error(error.error.serverError ?? "Erro ao salvar configuracoes");
    },
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no maximo 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAction.execute({
      name,
      logoUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Clinic Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informacoes da Clinica</CardTitle>
          <CardDescription>Nome e dados basicos da clinica</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Clinica</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da clinica"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Logo (Whitelabel)</CardTitle>
          <CardDescription>
            Personalize o sistema com a logo da sua clinica. Recomendado: imagem PNG transparente, max 2MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Preview */}
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/50">
              {logoUrl ? (
                <>
                  <Image
                    src={logoUrl}
                    alt="Logo"
                    fill
                    className="object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={() => setLogoUrl(null)}
                    className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-white shadow-md hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Upload className="h-6 w-6" />
                  <span className="text-[10px]">Logo</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Enviar Logo
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, SVG ou WebP. Max 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={updateAction.isExecuting}>
          {updateAction.isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Configuracoes
        </Button>
      </div>
    </form>
  );
}
