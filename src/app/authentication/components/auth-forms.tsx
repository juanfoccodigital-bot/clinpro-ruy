"use client";

import Image from "next/image";

import LoginForm from "./login-form";

export default function AuthForms() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Brand */}
      <div
        className="relative hidden w-[55%] flex-col items-center justify-center overflow-hidden lg:flex"
        style={{ background: "#1A1310" }}
      >
        {/* Subtle gold gradient orbs */}
        <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-[#D08C32]/8 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[#D3AB32]/5 blur-[100px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-16 text-center">
          {/* Logo branca oficial */}
          <div className="mb-16">
            <Image
              src="/logo-branca.png"
              alt="Elo Rejuvenescimento Facial"
              width={420}
              height={210}
              className="drop-shadow-2xl"
              priority
            />
          </div>

          {/* Divider */}
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#D08C32]/40 to-transparent mb-8" />

          {/* Tagline */}
          <p className="max-w-sm text-base leading-relaxed text-white/40">
            Sistema de gestão exclusivo para harmonização orofacial e estética regenerativa
          </p>
        </div>

        {/* Bottom */}
        <div className="absolute bottom-8 text-xs text-white/20">
          Powered by Fyre Soluções
        </div>
      </div>

      {/* Right side - Login */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 lg:w-[45%]">
        {/* Mobile logo */}
        <div className="mb-10 flex flex-col items-center lg:hidden">
          <Image
            src="/logoelo.png"
            alt="Elo Clinic"
            width={72}
            height={72}
            className="mb-4"
            priority
          />
          <h1 className="text-xl font-bold text-[#261C10]">Elo Clinic</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Rejuvenescimento Facial
          </p>
        </div>

        <div className="w-full max-w-[380px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#261C10]">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          {/* Login form */}
          <LoginForm />

          {/* Footer */}
          <p className="mt-10 text-center text-[11px] text-muted-foreground/60">
            © 2026 ClinPro · Fyre Soluções
          </p>
        </div>
      </div>
    </div>
  );
}
