import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// In-memory rate limiter for auth API endpoints
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (entry.resetAt < now) rateLimitMap.delete(key);
    }
  }, 5 * 60 * 1000);
}

function checkRateLimit(
  ip: string,
  windowMs: number,
  max: number,
): NextResponse | null {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count++;
  if (entry.count > max) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
        },
      },
    );
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files (images, fonts, etc.)
  if (/\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|eot)$/i.test(pathname)) {
    return NextResponse.next();
  }

  // Rate limit auth API endpoints (defense-in-depth)
  if (pathname.startsWith("/api/auth")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const rateLimitResponse = checkRateLimit(ip, 60_000, 30);
    if (rateLimitResponse) return rateLimitResponse;
    return NextResponse.next();
  }

  // Protected routes: require session
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/authentication", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/auth/:path*",
    "/dashboard",
    "/patients",
    "/doctors",
    "/appointments",
    "/subscription",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|authentication).*)",
  ],
};
