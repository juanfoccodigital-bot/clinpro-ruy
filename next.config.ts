import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "**.facebook.com",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=()",
          },
          ...(isDev
            ? []
            : [
                {
                  key: "Content-Security-Policy",
                  value: [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
                    "style-src 'self' 'unsafe-inline'",
                    "img-src 'self' data: blob: https://*.googleusercontent.com https://*.google.com https://*.fbcdn.net https://*.facebook.com",
                    "media-src 'self' data: blob:",
                    "font-src 'self'",
                    "connect-src 'self' data: blob: https://accounts.google.com https://api.stripe.com https://*.supabase.com https://*.supabase.co",
                    "frame-src https://accounts.google.com https://js.stripe.com",
                    "frame-ancestors 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                  ].join("; "),
                },
              ]),
        ],
      },
    ];
  },
};

export default nextConfig;
