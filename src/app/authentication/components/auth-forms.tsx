"use client";

import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import LoginForm from "./login-form";
import SignUpForm from "./sign-up-form";

export default function AuthForms() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Brand */}
      <div
        className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden lg:flex"
        style={{ background: "linear-gradient(145deg, #261C10 0%, #3D2B18 30%, #D08C32 70%, #D3AB32 100%)" }}
      >
        {/* Decorative grain overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

        {/* Background blurs */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-[#D08C32]/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-56 w-56 rounded-full bg-[#D3AB32]/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#D08C32]/5 blur-3xl" />
        </div>

        {/* Floating particles */}
        <div className="absolute left-[15%] top-[20%] h-1.5 w-1.5 animate-float rounded-full bg-white/15" />
        <div className="absolute right-[20%] top-[30%] h-2 w-2 animate-float delay-2 rounded-full bg-[#D3AB32]/20" />
        <div className="absolute left-[30%] bottom-[25%] h-2 w-2 animate-float delay-4 rounded-full bg-white/10" />
        <div className="absolute right-[15%] bottom-[35%] h-1.5 w-1.5 animate-float delay-1 rounded-full bg-[#D08C32]/25" />
        <div className="absolute left-[60%] top-[15%] h-1 w-1 animate-pulse-soft rounded-full bg-white/20" />
        <div className="absolute left-[10%] bottom-[40%] h-1 w-1 animate-pulse-soft delay-3 rounded-full bg-[#D3AB32]/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-12 text-center">
          {/* Animated logo */}
          <div className="relative mb-10">
            <div className="absolute -inset-8 animate-pulse-soft rounded-full bg-[#D08C32]/10 blur-2xl" />
            <div className="absolute -inset-4 rounded-full bg-white/5 blur-xl" />
            <div className="relative animate-float">
              <Image
                src="/logoelo.png"
                alt="Elo Clinic"
                width={130}
                height={130}
                className="drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-white">
            ClinPro
          </h1>
          <div className="mb-6 h-0.5 w-16 rounded-full bg-gradient-to-r from-transparent via-[#D3AB32]/60 to-transparent" />
          <p className="mb-10 max-w-md text-lg leading-relaxed text-white/70">
            Gestao completa para clinicas de harmonizacao orofacial e estetica regenerativa
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              "Agendamentos",
              "Prontuarios",
              "Protocolos Esteticos",
              "Financeiro",
              "CRM",
              "IA",
            ].map((feature, i) => (
              <span
                key={feature}
                className="animate-fade-slide-up rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-md transition-all duration-300 hover:border-[#D3AB32]/30 hover:bg-white/10"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom text */}
        <div className="absolute bottom-8 flex items-center gap-2 text-sm text-white/40">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/20" />
          Seguro, rapido e feito para clinicas de estetica.
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/20" />
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="flex w-full flex-col items-center justify-center bg-[#FFF9F3] px-6 lg:w-1/2">
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
            Harmonizacao Orofacial & Estetica Regenerativa
          </p>
        </div>

        <div className="w-full max-w-[420px]">
          <div className="mb-8 hidden text-center lg:block">
            <h2 className="text-2xl font-bold text-[#261C10]">Bem-vindo de volta</h2>
            <p className="mt-1 text-sm text-muted-foreground">Entre na sua conta para continuar</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-[#261C10]/5 p-1">
              <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#261C10]">Login</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#261C10]">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-muted-foreground mt-8 text-center text-xs">
          Ao continuar, voce concorda com nossos termos de uso e politica de privacidade.
        </p>
      </div>
    </div>
  );
}
