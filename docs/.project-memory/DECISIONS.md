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

## D-014 | 2026-11-18 | Domain theaibusinesskit.com; apex canonical, Cloudflare handles www
Why: one canonical host for SEO. Cloudflare proxies DNS: CNAME www -> apex plus a Single Redirect (https://www.* -> https://${1}, 301, query kept); Always Use HTTPS on. www is not added in Railway.
Verified 2026-11-18: https www -> one 301 to apex; http www -> 2 hops; http apex -> 1 hop. SSL/TLS mode Full or Full (strict) told to Phil, not verified.
Owner: Phil. Affects: Yuki (SITE_URL, canonical, sitemap), Viktor (CSP, headers).

## D-015 | 2026-11-18 | robots.txt lives in app/robots.ts only; block AI training crawlers
Why: Cloudflare's managed robots.txt added about 30 disallows that were not in the repo. The site is about AI visibility, and the K03-T1 robots.txt tester will be tried on this site first, so every rule must be in code with a reason.
Shape: Cloudflare managed robots.txt off (Phil). app/robots.ts allows Googlebot, Bingbot, OAI-SearchBot and PerplexityBot; disallows GPTBot, ClaudeBot, CCBot, Google-Extended and Applebot-Extended (tokens checked on vendor pages 18 Nov 2026). Search and user-fetch agents (ChatGPT-User, Claude-SearchBot, Claude-User) stay allowed.
Edge: Cloudflare also returns 403 to some training crawlers at the edge (seen with GPTBot, ClaudeBot, CCBot and Bytespider user agents, 18 Nov 2026). Kept on, as it matches this decision. Search agents get 200.
Note: Google-Extended also covers Gemini grounding, so Gemini apps may not use these pages in answers. Google says it does not affect inclusion or ranking in Google Search.
Owner: Phil. Affects: Yuki (robots.ts), K03-T1 tester (use this site as a test case).

## D-016 | 2026-11-18 | Site voice is brand-led, not Phil first person
Why: first person came from the writing-style-phil skill, not a strategy call. No-face video, no LinkedIn, no outreach or community mean readers cannot get to know Phil, so a personal brand has costs without the main benefit. Brand-led protects Phil's privacy, fits brand-name social accounts, allows help or handover later.
Shape: pages speak as "The AI Business Kit" or "this site", neutral voice, no "I/me/my", never "we/our/us" (one person, no team). Phil stays as named author ("Written by Phil" byline on guides, one factual line on About) and email sender "Phil at The AI Business Kit". /privacy names Phil as data controller (UK GDPR); rest in brand voice. Consent checkbox wording unchanged (reader's "I"), so no new consent version. Organization JSON-LD confirmed; settles "Organization (or Person)" in handoff item 5.
Owner: Phil. Affects: Margot (copy rewrite), Yuki (byline, JSON-LD), Tomas (Kit sender name).

## D-017 | 2026-11-19 | Launch with the robots.txt tester and three posts; tools stay in this app
Why: launch needs at least one tool. Tester (K03-T1) fits D-015 and the get-found theme. Posts K03-B5, K08-B5, K03-B4. Estimate 3-4 weeks at 5-7 hrs/week (12 hrs build, Viktor SSRF pass, 6.5 hrs writing). No launch date set.
Order: Marcus spec, build tester while Phil writes posts, Viktor audit and Yuki F6 CSP, rules pack and tool links in posts, launch. K03-B1 pillar waits for the tester.
Fallback: if Phil wants to go live within about 2 weeks, launch with client-side K08-T1 generator (about 6 hrs, no SSRF), add the tester after.
Tools stay in one Next.js app (D-003 reaffirmed). Upgrade path: a heavy tool moves to its own Railway service with /tools/<slug> routed to it, URL unchanged.
Owner: Phil. Affects: Marcus (spec), Yuki, Tomas, Noor (builder choice open), Viktor, Margot. Inputs: specs/robots-tools-inputs.md (tester and generator, one spec).

## D-018 | 2026-11-19 | No pnpm monorepo
Why: one deployable app; shared code works as lib/ imports. Existing pnpm-workspace.yaml is pnpm config, keep it.
Rejected: monorepo with packages/ (extra tooling, no second consumer).
Revisit if: a second deployable service appears, or shared code is published as a package.
Owner: Phil. Affects: Marcus, Yuki, Tomas.

## D-019 | 2026-11-19 | PROPOSED: robots tools structure (tester K03-T1, generator K08-T1)
Why: the browser parses, so fetched and pasted files share one code path. The server route only fetches. Parser and merge are hand-written for line-level output. Files pass between tools in sessionStorage. Status-per-bot check sits behind its own button and route.
Rejected: robots-parser (yes/no answers only, last release Feb 2023); a diff library (the merge knows its changes); query-string hand-off (logs, length).
Shape: tool code together in app/tools/_robots/ (logic/: bots, parse, match, merge, fetch server-only; ui/: components) per Phil; generic SSRF guard in lib/net/safe-fetch.ts (node:https plus request-filtering-agent), lib/read-capped.ts, lib/rate-limit.ts; routes stay at app/api/tools/ (D-003); no app/tools/_shared until a second tool needs it. Spec: docs/specs/robots-tools-build-plan.md (S-002, D11).
Owner: Marcus, Phil to confirm (open questions Q3, Q4). Affects: Phil (builder), Viktor (SSRF audit), Margot (tools copy).

## D-020 | 2026-11-19 | PROPOSED: tester launches first; estimate revised to about 20 hrs tester, 10 hrs generator
Why: D-017 needs one tool; the generator reuses the parser. Backlog said 12 and 6; the gap is tests, the SSRF guard and the status check. A safe generator-first fallback (with merge) is about 13 hrs, so it saves little.
Rejected: both tools at launch (about 2 weeks later); generator without merge (duplicate groups combine and Allow wins ties, so blocks fail).
Note: step 9 (status per bot) can move to just after launch to save 2.5 hrs.
Owner: Marcus, Phil to confirm (Q1, Q2). Affects: Priya (launch date), Phil.
