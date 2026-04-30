import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // Next.js 16 App Router streams inline `self.__next_f.push(...)` RSC
            // payload scripts that are required for hydration. Until we add a
            // proxy/middleware that emits a per-request nonce + `'strict-dynamic'`,
            // we keep `'unsafe-inline'` for `script-src` so the client can hydrate.
            // Style allowance for `'unsafe-inline'` is required for shadcn/ui
            // primitives that emit inline `<style>` for animations/positioning.
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self' https://fonts.gstatic.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
        ]
      }
    ];
  },
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
