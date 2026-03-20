import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function ComingSoon({ title, description, icon: Icon }: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mt-6 text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-md text-center">
        {description}
      </p>
      <Badge variant="secondary" className="mt-4 text-sm px-4 py-1">
        Em breve!
      </Badge>
    </div>
  );
}
