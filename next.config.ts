import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do NOT use output: 'export' for Vercel.
  // Vercel deploys Next.js natively — SSR, ISR, and static pages all work.
  // 'output: export' breaks `next start`, Clerk middleware, and CSP headers.
  images: {
    // Allow unoptimized images since we serve from public/ directly
    unoptimized: true,
  },
  // Security headers — applied by Vercel's CDN on every response
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
              "worker-src 'self' blob:",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.clerk.com https://*.clerk.dev",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.clerk.accounts.dev https://clerk.com https://*.clerk.com https://*.clerk.dev https://huggingface.co https://*.huggingface.co https://raw.githubusercontent.com https://cdn.jsdelivr.net https://*.mlc.ai",
              "frame-src 'self' https://*.clerk.accounts.dev https://clerk.com https://*.clerk.com https://*.clerk.dev",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
