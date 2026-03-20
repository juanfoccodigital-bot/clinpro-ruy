"use client";

import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Creative {
  id: string;
  name: string;
  thumbnailUrl: string;
  spend: number;
  leads: number;
  cpl: number;
  ctr: number;
}

interface AdsTopCreativesProps {
  creatives: Creative[];
}

export default function AdsTopCreatives({ creatives }: AdsTopCreativesProps) {
  if (creatives.length === 0) return null;

  return (
    <Card className="animate-fade-slide-up" style={{ animationDelay: "525ms" }}>
      <CardHeader>
        <CardTitle className="text-lg">Melhores Criativos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {creatives.map((c, i) => (
            <div
              key={c.id}
              className="group relative overflow-hidden rounded-xl border bg-card transition-all duration-300 hover-glow"
            >
              {/* Thumbnail */}
              {c.thumbnailUrl ? (
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={c.thumbnailUrl}
                    alt={c.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white">
                    {i + 1}
                  </div>
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center bg-muted">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {i + 1}
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div className="p-3 space-y-2">
                <p className="text-xs font-medium truncate">{c.name}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Investido</p>
                    <p className="font-semibold">R$ {c.spend.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Leads</p>
                    <p className="font-semibold text-emerald-600">{c.leads}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CPL</p>
                    <p className="font-semibold">{c.cpl > 0 ? `R$ ${c.cpl.toFixed(2)}` : "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CTR</p>
                    <p className="font-semibold">{c.ctr.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
