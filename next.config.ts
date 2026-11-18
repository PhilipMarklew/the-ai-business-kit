import type { NextConfig } from "next";

/**
 * Response headers on every route. Audit tools (Lighthouse, Ahrefs, Moz) and
 * browsers check these. HSTS only takes effect over HTTPS, so it is harmless
 * on localhost. No Content-Security-Policy yet: it needs care with Next's
 * inline scripts and with GA4 once that lands (open question for Viktor).
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Drops the "X-Powered-By: Next.js" header. It tells visitors nothing useful.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
