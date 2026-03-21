"use client";

import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import LoginForm from "./login-form";
import SignUpForm from "./sign-up-form";

export default function AuthForms() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Brand */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden lg:flex" style={{ background: "linear-gradient(135deg, #D08C32, #D3AB32, #261C10)" }}>
        {/* Background blurs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-white blur-3xl" />
        </div>

        {/* Floating particles */}
        <div className="absolute left-[15%] top-[20%] h-2 w-2 animate-float rounded-full bg-white/20" />
        <div className="absolute right-[20%] top-[30%] h-3 w-3 animate-float delay-2 rounded-full bg-white/15" />
        <div className="absolute left-[30%] bottom-[25%] h-2.5 w-2.5 animate-float delay-4 rounded-full bg-white/20" />
        <div className="absolute right-[15%] bottom-[35%] h-2 w-2 animate-float delay-1 rounded-full bg-white/25" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-12 text-center">
          {/* Animated logo */}
          <div className="relative mb-8">
            <div className="absolute -inset-4 animate-pulse-soft rounded-full bg-white/10 blur-xl" />
            <div className="relative animate-float">
              <Image
                src="/logoelo.png"
                alt="Elo Clinic"
                width={120}
                height={120}
                className="drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white">
            ClinPro
          </h1>
          <p className="mb-8 max-w-sm text-lg text-white/80">
            Gestão completa para clínicas de harmonização orofacial e estética regenerativa
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Agendamentos",
              "Prontuários",
              "Protocolos Estéticos",
              "Financeiro",
              "CRM",
              "IA",
            ].map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom text */}
        <div className="absolute bottom-8 text-sm text-white/50">
          Seguro, rápido e feito para clínicas de estética.
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center lg:hidden">
          <Image
            src="/logoelo.png"
            alt="Elo Clinic"
            width={64}
            height={64}
            className="mb-3"
            priority
          />
          <h1 className="text-2xl font-bold text-gradient">Elo Clinic</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Harmonização Orofacial & Estética Regenerativa
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full max-w-[420px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Criar conta</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <SignUpForm />
          </TabsContent>
        </Tabs>

        <p className="text-muted-foreground mt-8 text-center text-xs">
          Ao continuar, voce concorda com nossos termos de uso e politica de privacidade.
        </p>
      </div>
    </div>
  );
}
