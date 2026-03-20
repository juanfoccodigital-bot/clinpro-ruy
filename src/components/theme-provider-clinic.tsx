"use client";

import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";

function hexToOklchParts(hex: string): { L: number; C: number; H: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bVal = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const C = Math.sqrt(a * a + bVal * bVal);
  let H = (Math.atan2(bVal, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { L, C, H };
}

export function ClinicThemeProvider({ children }: { children: React.ReactNode }) {
  const session = authClient.useSession();

  useEffect(() => {
    const clinic = (session.data?.user as Record<string, unknown>)?.clinic as
      | Record<string, unknown>
      | undefined;
    if (!clinic) return;

    const primaryColor = clinic.primaryColor as string | undefined;
    if (!primaryColor || !primaryColor.startsWith("#")) return;

    const root = document.documentElement;
    const { L, C, H } = hexToOklchParts(primaryColor);

    // Set primary color and derived variants
    root.style.setProperty("--primary", `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`);
    root.style.setProperty(
      "--primary-foreground",
      L > 0.6 ? "oklch(0.15 0.02 " + H.toFixed(1) + ")" : "oklch(0.98 0.005 " + H.toFixed(1) + ")",
    );

    // Ring color
    root.style.setProperty("--ring", `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`);

    return () => {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-foreground");
      root.style.removeProperty("--ring");
    };
  }, [session.data]);

  return <>{children}</>;
}
