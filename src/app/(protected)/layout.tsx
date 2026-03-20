import WithAuthentication from "@/hocs/with-authentication";

import { TopNavigation } from "./_components/top-navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WithAuthentication mustHaveClinic>
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-amber-50/20 to-white">
        <TopNavigation />
        <main className="w-full flex-1">{children}</main>
        <footer className="w-full border-t border-amber-100/50 bg-white/80 backdrop-blur-sm py-3 text-center text-sm text-muted-foreground">
          Criado por Fyre Soluções — ClinPro © 2026
        </footer>
      </div>
    </WithAuthentication>
  );
}
