"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const totpSchema = z.object({
  code: z.string().length(6, "O codigo deve ter 6 digitos"),
});

const backupSchema = z.object({
  code: z.string().min(1, "Codigo de backup obrigatorio"),
});

const TwoFactorForm = () => {
  const router = useRouter();
  const [useBackupCode, setUseBackupCode] = useState(false);

  const totpForm = useForm<z.infer<typeof totpSchema>>({
    resolver: zodResolver(totpSchema),
    defaultValues: { code: "" },
  });

  const backupForm = useForm<z.infer<typeof backupSchema>>({
    resolver: zodResolver(backupSchema),
    defaultValues: { code: "" },
  });

  const handleTotpSubmit = async (values: z.infer<typeof totpSchema>) => {
    const result = await authClient.twoFactor.verifyTotp({
      code: values.code,
    });
    if (result.error) {
      toast.error("Codigo invalido. Tente novamente.");
      return;
    }
    router.push("/dashboard");
  };

  const handleBackupSubmit = async (values: z.infer<typeof backupSchema>) => {
    const result = await authClient.twoFactor.verifyBackupCode({
      code: values.code,
    });
    if (result.error) {
      toast.error("Codigo de backup invalido.");
      return;
    }
    router.push("/dashboard");
  };

  if (useBackupCode) {
    return (
      <Card>
        <Form {...backupForm}>
          <form onSubmit={backupForm.handleSubmit(handleBackupSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Codigo de Backup
              </CardTitle>
              <CardDescription>
                Digite um dos seus codigos de backup para acessar sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={backupForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Codigo de Backup</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o codigo de backup"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={backupForm.formState.isSubmitting}
              >
                {backupForm.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Verificar
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setUseBackupCode(false)}
              >
                Usar codigo TOTP
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    );
  }

  return (
    <Card>
      <Form {...totpForm}>
        <form onSubmit={totpForm.handleSubmit(handleTotpSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verificacao em Duas Etapas
            </CardTitle>
            <CardDescription>
              Digite o codigo de 6 digitos do seu aplicativo autenticador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={totpForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Codigo TOTP</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={totpForm.formState.isSubmitting}
            >
              {totpForm.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verificar
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setUseBackupCode(true)}
            >
              Usar codigo de backup
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default TwoFactorForm;
