# ARCHITECTURE (updated 2026-11-18, from repo layout and git log; verify at each wrap-up)
Stack: Next.js (app router), Tailwind v4, shadcn, pnpm. Host: Railway (D-005). Config: server-only SITE_NAME, SITE_URL (D-004).
Product and brand context: PRODUCT.md. Original architecture spec: docs/specs/S00-1-architecture.md.

## Layout
- app/: api/subscribe/route.ts (POST, body byte cap via readCapped), page.tsx, about, privacy, newsletter, blog (+ /blog/<slug>), topics (/topics/<slug>), tools (index + /tools/<slug>), robots.ts, sitemap.ts, manifest.ts, feed.xml/route.ts (RSS, published only), icon.svg, apple-icon.png, favicon.ico (static logo files; source artwork in brand/; manifest icons in public/, icon-512.png is the JSON-LD logo), opengraph-image.tsx (default share image), not-found.tsx, globals.css (theme tokens)
- components/: analytics-script/umami-tracker/analytics-opt-out/tracked-link, site-header/footer, post-card/cover, listing-header, topic-nav, tools-strip, signup-form/band, follow-links, json-ld (shared JsonLd + breadcrumbs), organization-json-ld, article-json-ld, tool-shell-heading, ui/ (shadcn)
- content/posts/: MDX posts. Frontmatter: title, description, topic, date, updated, draft, optional seoTitle/seoDescription.
- proxy.ts (root): returns real 404 status for unknown /blog/<slug>, /blog/<slug>/opengraph-image, /topics/<slug>.
- lib/: metadata.ts (pageMetadata, articleMetadata), og.tsx (share image colours, fonts, brand mark), site.ts (env config), posts.ts + mdx.tsx (post loading and render), topics.ts (3 topics: Get found, Get trusted, Run better), tools.ts (tool registry), tool-metadata.ts, copy.ts (Margot copy), social.ts (profile URLs; X set, TikTok and YouTube null), subscribe-client.ts (browser), subscribe.ts (validation and orchestration), kit.ts (Kit API v4 client), rate-limit.ts, analytics.ts

## Rules
- Drafts: shown in dev or SHOW_DRAFTS=true; always noindex; never in sitemap.
- Per-post share images via next/og.
- Every page must set metadata via pageMetadata()/articleMetadata(); Next replaces, not merges, openGraph/alternates.
- Any new dynamic route must be added to the proxy.ts matcher, or unknown slugs return 200 (soft 404; Cache Components streams the shell before notFound()).
- Security headers in next.config.ts (HSTS, nosniff, Referrer-Policy, X-Frame-Options DENY, Permissions-Policy). No CSP yet.
- Theme: dark default, light follows phone setting; coral accent oklch(0.72 0.16 28); Manrope via next/font.
- Follow links stay hidden until lib/social.ts URLs are set.
- Rate limiting: lib/rate-limit.ts in-memory sliding window (D-007): per-IP on X-Real-IP (skipped when header missing) plus global 20/min cap.
- /api/subscribe: Kit API v4 (lib/kit.ts, env KIT_API_KEY, KIT_FORM_ID = numeric form ID, not the embed UID). Kit form "Newsletter site". Add `import "server-only"` to lib/kit.ts (Viktor hardening).

## Analytics (Umami Cloud, cookieless)
- lib/analytics.ts is the only file that knows Umami: track(event, data), opt-out helpers, script URL. No-op on the server, when the tracker is not loaded, or when the browser opted out.
- components/analytics-script.tsx (in app/layout.tsx) renders only when NODE_ENV=production and NEXT_PUBLIC_UMAMI_WEBSITE_ID is set. It inlines the before-send hook (lib/analytics.ts BEFORE_SEND_SCRIPT: cancels on Global Privacy Control, strips query strings from url and same-site referrer, keeps utm_*), then components/umami-tracker.tsx loads cloud.umami.is/script.js (afterInteractive) with data-domains = hostname of SITE_URL, data-do-not-track, data-exclude-hash, data-before-send. The tracker is not loaded at all for opted-out or GPC visitors. Not proxied.
- Never use data-distinct-id, identify(), data-errors, data-exclude-search (drops utm tags) or the recorder.
- Later option (not built): self-host a pinned copy of the script in public/ and drop cloud.umami.is from script-src (Viktor U3). The ID is read at build time: redeploy after changing it.
- Events (closed union AnalyticsEventMap): signup {placement, tool? (slug, on tool pages)}, signup_error {error code}, follow_click {network, placement}, tool_run {tool} (reserved). Page views are automatic. Never send an email or free text.
- Tools: call track("tool_run", { tool: "<slug>" }) from the tool's client component.
- Opt-out: components/analytics-opt-out.tsx (id="opt-out") on /privacy, linked from the footer on every page (copy.privacy.optOut.footerLink) sets localStorage "umami.disabled"="1" (documented Umami flag). Copy in lib/copy.ts privacy.optOut says the choice is per browser; keep that true.
- SignupForm takes a required `placement` prop. Social links use components/tracked-link.tsx (FollowLink).
- CSP (still unbuilt) must allow script-src https://cloud.umami.is and connect-src https://gateway.umami.is (the tracker posts to gateway.umami.is/api/send; confirm in DevTools).
