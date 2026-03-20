import type { LucideIcon } from "lucide-react";

export const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full space-y-6 p-6">{children}</div>;
};

export const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full items-center justify-between">{children}</div>
  );
};

export const PageHeaderContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="w-full space-y-1">{children}</div>;
};

export const PageTitle = ({ children }: { children: React.ReactNode }) => {
  return <h1 className="text-2xl font-bold">{children}</h1>;
};

export const PageDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <p className="text-muted-foreground text-sm">{children}</p>;
};

export const PageActions = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center gap-2">{children}</div>;
};

export const PageContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-6">{children}</div>;
};

interface PageBannerProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export const PageBanner = ({
  icon: Icon,
  title,
  description,
  children,
}: PageBannerProps) => {
  return (
    <div className="animate-fade-slide-up relative overflow-hidden rounded-2xl border bg-gradient-to-br from-amber-500/10 via-yellow-600/5 to-transparent p-6 md:p-8">
      {/* Decorative elements */}
      <div className="animate-float absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/10 to-yellow-600/10" />
      <div className="animate-float absolute -right-4 top-12 h-20 w-20 rounded-full bg-gradient-to-br from-yellow-600/10 to-amber-500/5" style={{ animationDelay: "1s" }} />
      <div className="animate-pulse-soft absolute left-1/2 -top-4 h-16 w-16 rounded-full bg-amber-500/5" />

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-700 shadow-lg shadow-amber-500/20">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {title}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {description}
            </p>
          </div>
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </div>
  );
};
