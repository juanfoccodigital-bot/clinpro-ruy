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
        <footer className="w-full border-t border-[#D08C32]/8 bg-white/60 backdrop-blur-xl py-4 dark:bg-[#261C10]/60">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Criado por</span>
            <span className="text-gradient font-semibold">Fyre Solucoes</span>
            <span className="text-[#D08C32]/30">|</span>
            <span>ClinPro &copy; 2026</span>
          </div>
        </footer>
      </div>
    </WithAuthentication>
  );
}
