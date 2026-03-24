import "./globals.css";

import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/providers/react-query";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClinPro - Harmonização Orofacial & Estética Regenerativa",
  description: "Sistema de gestão para clínicas de harmonização orofacial e estética regenerativa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ClinPro" />
        <link rel="apple-touch-icon" href="/logoelo.png" />
        <meta name="theme-color" content="#D08C32" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${manrope.variable} antialiased`}>
        <ReactQueryProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </ReactQueryProvider>
        <Toaster position="bottom-center" richColors theme="light" />
      </body>
    </html>
  );
}
