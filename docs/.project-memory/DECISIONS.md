# DECISIONS (append-only, 5 lines per entry)
Note: handoff IDs D1-D4 are task-level (S00-1). They are cited here as "S00 D<n>".

## D-001 | 2026-11-17 | Adopted the agent team and project-memory system
Why: 5-7 hrs/week available; memory files keep sessions cold-start safe.
Rejected: none recorded.
Owner: Phil. Affects: all agents.

## D-002 | 2026-11-13 | Stack: Next.js, React, Tailwind v4, shadcn, pnpm on Railway (S00 D3)
Why: Phil confirmed after comparing Astro; uses his existing Railway account. Vercel Hobby is non-commercial only.
Rejected: Astro (content-first alternative), Vercel Hobby. Not to be reopened.
Owner: Phil. Affects: Marcus (confirm Railway plan, cost, terms), Yuki, Tomas.

## D-003 | 2026-11-17 | Route layout: static folder per tool under app/tools/<slug>, shared root + tools layout
Why: tools have distinct UIs; one folder + one lib/tools.ts entry meets the 10-minute add check. Server work at app/api/tools/<slug>.
Rejected: dynamic app/tools/[name] with component registry; /tools index page (not a directory; revisit at 3+ tools).
Owner: Marcus. Affects: Yuki, Tomas. Spec: docs/specs/S00-1-architecture.md

## D-004 | 2026-11-17 | Config via server-only SITE_NAME, SITE_URL env vars; domain change = redeploy
Why: build does not wait on S00 D1; all consumers render server-side, so no NEXT_PUBLIC_ needed.
Rejected: NEXT_PUBLIC_ vars (leak to client bundle for no reason); hard-coded domain.
Owner: Marcus. Affects: Yuki, Tomas.

## D-005 | 2026-11-17 | Railway Hobby, next start, 1 replica, Railway built-in CDN (free on all plans). No Cloudflare (S00 D3 confirmed)
Why: est. $5-8/month; persistent Node server suits outbound fetch routes; CDN free and avoids third-party proxy breaking X-Real-IP.
Rejected: Cloudflare Free in front (DNS/proxy admin, client-IP header issues). Usage alert $10, hard limit $20/month.
Owner: Marcus (Phil decided D3). Affects: Yuki (deploy), Tomas (rate limit keying).

## D-006 | 2026-11-17 | S00 D2 recommendation: Kit Free (CONFIRMED 2026-11-18, Phil set up the account)
Why: 10,000 free subs, no send limit, API on free, double opt-in via API, CSV export, DPA names UK GDPR + IDTA.
Rejected: beehiiv (ad-network controller profiling), Brevo (300/day), MailerLite (250 cap), Buttondown (100 cap; runner-up at $9/mo).
Owner: Phil on Marcus's recommendation. Affects: Tomas, Margot (consent wording), Viktor.

## D-007 | 2026-11-17 | Rate limiting: in-memory sliding window per IP (X-Real-IP), lib/rate-limit.ts
Why: single replica, no paid infra; resets on deploy are acceptable at this scale.
Rejected: Redis/Upstash (cost, needless at 1 replica); Next.js proxy/middleware. Upgrade: Redis behind same signature at 2+ replicas.
Owner: Marcus. Affects: Tomas, Viktor.

## D-008 | 2026-11-17 | S00 D4 recommendation: consent records in provider only, no Supabase
Why: Kit holds who/when/how; "what wording" closed by tagging each signup with consent text version kept in git.
Rejected: Supabase consent table (second personal-data store, DPA, RLS, deletion duties for no gain).
Owner: Marcus (Astrid to confirm). Affects: Tomas, Margot, Viktor.

## D-009 | 2026-11-17 | S00 D1: hub name "The AI Business Kit"
Why: Phil's choice. .com and TikTok handle available per Phil.
Checks done 2026-11-18 (Phil): X, YouTube and TikTok handles available; no UK trademarks or businesses under the name. Domain not yet bought (Phil: soon).
Owner: Phil. Affects: Margot (copy), Yuki (SITE_NAME), Phil (domain, social accounts).

## D-010 | 2026-11-17 | Scope change: site is a blog with tools, articles first
Why: Phil's call. Blog was out of scope in the S00-1 handoff; adds about a day of build.
Shape: MDX in content/posts/ (frontmatter title, description, topic, date, updated, draft). Drafts show in dev or SHOW_DRAFTS=true, always noindex, never in sitemap. Topics in lib/topics.ts: Get found / Get trusted / Run better. Routes /blog, /blog/<slug>, /topics/<slug>, /tools. Per-post share images via next/og.
Owner: Phil. Affects: Yuki, Margot, Viktor, Eleanor, Quinn. Supersedes D-003 note "no /tools index page".

## D-011 | 2026-11-17 | Visual: dark brand look, light theme follows phone setting, coral accent
Why: Phil's choice (Runpod-like). Accent oklch(0.72 0.16 28), Manrope via next/font. Brand context in PRODUCT.md.
Rejected: hi-vis yellow / Archivo "signpost" concept (Phil). Noor's visual direction spec superseded (marked in file; signup-placement and "don't" rules still apply).
Owner: Phil. Affects: Yuki. No DESIGN.md yet; suggest /impeccable document.

## D-012 | 2026-11-17 | SEO: shared metadata helpers and proxy-level 404s
Why: Next replaces openGraph/alternates per page, so every page showed the home share title; Cache Components streams a 200 shell before notFound(), causing soft 404s.
Shape: lib/metadata.ts helpers used by every page; proxy.ts returns 404 for unknown blog and topic slugs.
Owner: Yuki (build), recorded by Priya. Affects: anyone adding routes (update proxy matcher), Viktor (CSP open).

## D-013 | 2026-11-18 | Analytics: Umami Cloud Hobby (free, cookieless), replaces GA4
Why: Phil wants a full funnel with no consent banner; cookieless statistical use fits the PECR exception. Free tier. EU region (permanent choice at creation).
Rejected: GA4 (cookies, consent banner); PostHog (cookie-first default, heavier script, more config risk).
Shape: lib/analytics.ts is the only Umami-aware file; events signup, signup_error, follow_click, tool_run; GPC/DNT respected; opt-out at /privacy#opt-out. Handoff item 10 (GA4) superseded.
Owner: Phil. Built by Yuki, copy by Margot. Affects: Viktor (CSP hosts), Phil (Umami setup).
