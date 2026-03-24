"use client";

import { Camera, Save } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [imagePreview, setImagePreview] = useState<string | null>(user.image);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageFile(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            image: imageFile,
          }),
        });

        if (!res.ok) throw new Error("Erro ao salvar");

        toast.success("Perfil atualizado");
        router.refresh();
      } catch {
        toast.error("Erro ao atualizar perfil");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meu Perfil</CardTitle>
        <CardDescription>Atualize sua foto e nome de exibição</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 ring-4 ring-[#D08C32]/10">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt={name}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-[#D08C32] to-[#D3AB32] text-white text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-[#D08C32] hover:underline font-medium"
            >
              Alterar foto
            </button>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
          />
        </div>

        {/* Email (read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input value={user.email} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending || (!name.trim())}
          className="bg-[#D08C32] hover:bg-[#C47A28] text-white"
        >
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Salvando..." : "Salvar perfil"}
        </Button>
      </CardContent>
    </Card>
  );
}
