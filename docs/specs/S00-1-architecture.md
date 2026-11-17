# Spec: S00-1 Site foundations, architecture note
Date: 2026-11-17 | Author: Marcus | Status: Draft | Spec ID: S-001

## Summary
One Next.js App Router app on one Railway service. Content pages and tools share one root layout. Each tool is its own static folder under `app/tools/`, with server code behind a shared safe-fetch and rate-limit module. Signup goes server-side to the email provider (recommended: Kit Free). No database, no Cloudflare, no paid infra.

## Assumptions
- A1. Phil's Railway account is on Hobby ($5/month incl. $5 usage). If it is on Pro, cost rises to $20/month (still in budget).
- A2. Other projects on the same Railway account share the $5 included usage. Phil checks current usage before deploy.
- A3. Traffic in the first 3 months stays under ~50k page views/month. One instance with 512 MB RAM covers this many times over.
- A4. The service runs as exactly 1 replica. The in-memory rate limiter depends on this (see D-007).
- A5. The confirmation (double opt-in) email counts as the "welcome email" in acceptance check 6. Kit Free has no automated sequences.
- A6. Region: Railway EU West (Amsterdam), nearest to a UK audience. Yuki confirms the region name at deploy.

## Decisions

**D-003 Route layout.** Static folders, no dynamic `[name]` route.
```
app/
  layout.tsx                 root: <html>, header, footer, Organization JSON-LD, metadataBase from SITE_URL
  page.tsx                   /
  about/page.tsx             /about
  privacy/page.tsx           /privacy
  newsletter/page.tsx        /newsletter
  not-found.tsx              404
  sitemap.ts, robots.ts      generated from lib/site.ts + lib/tools.ts
  tools/layout.tsx           tool shell: title slot, tool body, signup block under the tool
  tools/<slug>/page.tsx      one folder per tool, own metadata (S00-1 ships none; check uses test-tool)
  api/subscribe/route.ts     POST, signup
  api/tools/<slug>/route.ts  POST, per-tool server work (first: robots-txt-tester, W2-3)
lib/
  site.ts                    reads SITE_NAME, SITE_URL; throws at build if missing
  tools.ts                   typed array {slug, title, description, published} - feeds sitemap and links
  rate-limit.ts              in-memory limiter (S00-1, reused by tools)
  net/safe-fetch.ts          SSRF-safe fetch (W2-3, not S00-1)
```
Why: each tool has a different UI, so a dynamic route buys nothing and costs a switch statement. Adding a tool = one folder + one `lib/tools.ts` entry, which meets the "under 10 minutes" check. No `/tools` index page in S00-1 (the brief says hub, not directory); revisit at 3+ tools. URLs: lowercase, hyphenated, no trailing slash (Next default). Rejected: `app/tools/[name]/page.tsx` with a registry of components; route groups (nothing to group yet).

**D-004 Config.** `SITE_NAME`, `SITE_URL` (no trailing slash) are server-only env vars, read in `lib/site.ts`. No `NEXT_PUBLIC_` prefix: everything that needs them renders on the server. Railway passes service variables into the build, so static pages bake them in. Changing the domain = change the variable and redeploy. Other server-only vars: `KIT_API_KEY`, `KIT_FORM_ID`.

**D-005 Hosting: Railway Hobby, Node server (`next start`), 1 replica, built-in Railway CDN on. No Cloudflare.** Railway runs a persistent container, so long-running route handlers and outbound fetches work with no function time limits. Railway added a CDN in March 2026, "available on all plans at no additional cost"; cache hits use no compute and no egress. Turn it on with HTML caching left at "Auto" (caches HTML only when we send `s-maxage`) and purge on deploy. Rejected Cloudflare Free: costs £0 but adds DNS and proxy admin, and Railway forum reports show the client IP header carrying the CDN's IP when a third-party CDN sits in front. That breaks per-IP rate limiting. Upgrade path: Cloudflare in front if we ever see an attack Railway cannot absorb.

Cost estimate: Next.js idles at ~0.2-0.3 GB RAM (~$2-3/month at $10/GB-month) plus near-zero CPU. Total ~$5-8/month, so ~$15-25 (about £12-20) for 3 months. Set a usage email alert at $10 and a hard limit at $20 (worst case $60 over 3 months).

**D-006 (S00 D2) Email provider: Kit Free.** See comparison below.

**D-007 Rate limiting: in-memory sliding window per IP, in `lib/rate-limit.ts`.** A `Map<key, number[]>` of timestamps, swept every 60s. Key = route name + client IP from `X-Real-IP` (Railway's documented client-IP header). Limits: signup 5 per IP per 10 min; tool routes 10 per IP per min plus a global cap of 4 concurrent outbound fetches. State resets on deploy, which is fine at this scale. Rejected: Upstash/Railway Redis (paid or usage-billed, needless with 1 replica); Next.js proxy/middleware (harder to test, runs before body parse). Upgrade path: swap the Map for Redis behind the same function signature if we ever run 2+ replicas.

**D-008 (S00 D4) Consent records: provider only. No Supabase.** UK GDPR Art 7(1) asks us to show who consented, when, how, and to what wording. Kit records the email, signup time, form and the double opt-in confirmation. The gap is "what wording". Close it without a database: tag every signup with the consent text version (e.g. `consent-v2026-11`) and keep each version of the consent text in git. Supabase would add a second store of personal data, a DPA, RLS and deletion duties for no gain.

## Interface contracts

`POST /api/subscribe` (owner: tomas; caller: yuki)
- Request JSON: `{ email: string, consent: true, website: string }`. `website` is the honeypot; must be `""`.
- Validation: email trimmed, lower-cased, max 254 chars, basic format check; `consent` must be literal `true`; body max 2 KB.
- 200 `{ ok: true }` - new or existing address (never reveal which). Honeypot filled also returns 200 and does nothing.
- 400 `{ ok: false, error: "invalid_email" | "consent_required" }`
- 429 `{ ok: false, error: "rate_limited" }` with `Retry-After` header (seconds)
- 502 `{ ok: false, error: "provider_unavailable" }` - Kit error or timeout (5s)
- Server action: create subscriber, add to `KIT_FORM_ID` (triggers Kit's double opt-in email), apply tag `consent-<version>`. Response sets `Cache-Control: no-store`.

`lib/site.ts` exports `site: { name: string; url: string }`. `lib/tools.ts` exports `tools: { slug: string; title: string; description: string; published: boolean }[]`. Sitemap includes only `published: true`.

`lib/rate-limit.ts` exports `rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterS: number }`.

W2-3 contract (for reference, not built now): `lib/net/safe-fetch.ts` - http/https only, ports 80/443 only; resolve DNS and reject private, loopback, link-local, CGNAT, multicast, reserved and metadata ranges for IPv4 and IPv6 (incl. `169.254.0.0/16`, `100.64.0.0/10`, `fc00::/7`; Railway private networking is IPv6 in that range); connect to the checked IP to stop DNS rebinding; follow at most 3 redirects, re-checking each hop; 5s total timeout; stop reading at 500 KiB (Google's robots.txt parse limit); fixed User-Agent naming the site.

## Tasks
| # | Task | Owner | Depends on | Acceptance criteria |
|---|------|-------|------------|---------------------|
| 1 | Scaffold app per D-003 and D-004: layouts, 4 pages, 404, `lib/site.ts`, `lib/tools.ts`, `sitemap.ts`, `robots.ts` | yuki | - | Build fails with a clear message if `SITE_URL` is unset. `/sitemap.xml` and `/robots.txt` use `SITE_URL`. Adding `app/tools/test-tool/page.tsx` plus one `tools.ts` entry renders inside the tool shell. |
| 2 | `lib/rate-limit.ts` and `POST /api/subscribe` per contract | tomas | - | 6th request from one IP in 10 min returns 429 with `Retry-After`. Filled honeypot returns 200 and creates no Kit subscriber. Bad email returns 400. A real signup appears in Kit as unconfirmed with the consent tag. |
| 3 | Signup form on /newsletter and in tool shell, wired to task 2 contract | yuki | 2 (contract only) | Consent text shown next to the button. Inline errors with no page reload. Button disabled while sending. |
| 4 | Railway deploy: 1 replica, EU West, CDN on (HTML Auto, purge on deploy), usage alert $10, hard limit $20, env vars set | yuki | 1 | Site serves over HTTPS on the Railway domain. Response headers show the Railway edge. Usage limits visible in Railway settings. |

Security review required: task 2 and 3 (user input), and safe-fetch at W2-3.

## Security notes
- Signup route: user input, third-party API key, abuse target. Viktor checks validation, honeypot, rate limit, no account enumeration, key never sent to the client.
- Confirm on the live deploy that `X-Real-IP` holds the real client IP. Railway forum posts disagree on header trust. If wrong, the limiter keys every user on one IP.
- Robots tester (W2-3) is an SSRF surface. Railway's AUP bans "operating proxies". Return parsed results only, never raw passthrough of arbitrary URLs.

## Out of scope
Supabase, Redis, Cloudflare, any tool, a `/tools` index page, welcome sequences, analytics code beyond GA4 tag.

## Open questions
None block build. Phil decides D2 (recommended Kit Free) before task 2 goes live; tasks 1-3 can start against the contract.

---

## D2 comparison (all vendor pages checked 17 Nov 2026)

| | Kit | MailerLite | Brevo | beehiiv | Buttondown |
|---|---|---|---|---|---|
| Free subscriber cap | 10,000 [1] | 250 [3] | Not stated on pricing page [5]; help centre blocked automated check | 2,500 [7] | 100 [9] |
| Send limit | None on any plan [1] | 2,500/month [3] | 300/day [5] | Unlimited [7] | ~1 email/day to full list [9] |
| Double opt-in | Yes, form "incentive email"; API add-to-form triggers it [2] | Yes, toggle for API signups; editing the email is paid only [4] | Supported; free-plan availability not confirmed on vendor page | Yes, publication setting; API override [8] | On by default for API signups [10] |
| Export | CSV, emailed link [2b] | Not confirmed on pricing page | Not checked | "Data exports: yes" [7] | Not confirmed |
| API on free | Yes [1] | "Limited" [3] | Yes, REST API on all plans [5] | Yes, except Send API [7] | Yes (pricing schema lists API access) [9] |
| UK GDPR / DPA | DPA names UK GDPR, SCCs + UK IDTA; data in USA; sub-processors incl. OpenAI [11] | DPA names UK GDPR, UK Addendum; data in EU (Netherlands) [12] | DPA defines "EEA" to include the UK; EU (France) company [6] | DPA names UK GDPR, UK Addendum; **beehiiv acts as independent controller profiling subscribers for its ad network** [13] | DPA with SCCs + UK Addendum, updated 2026-10-23 [14] |
| Paid step-up | Creator $33/mo [1] | Paid from 250+ | Starter $9/mo [5] | Lite $49/mo [7] | Basic $9/mo, 1,000 subs [9] |

**Recommendation: Kit Free.** It is the only option with a free cap (10,000) we will not hit in 12 weeks, no send limit, API on free, built-in double opt-in through the API, CSV export, and a DPA that names UK GDPR and the UK IDTA. Costs: Kit branding on emails, one user, no welcome sequence, and data held in the US under the Data Privacy Framework and IDTA. Runner-up: Buttondown Basic at $9/month if Phil prefers a privacy-first vendor and no branding (~$27 over 3 months). Not recommended: beehiiv (ad-network profiling of Phil's subscribers sits badly with an audience built on trust), Brevo (300/day cap means staggered sends past 300 subscribers), MailerLite (250 cap, then paid).

Sources (all checked 17 Nov 2026):
[1] https://kit.com/pricing · [2] https://help.kit.com/en/articles/2502655-the-incentive-email and https://developers.kit.com/api-reference/forms/bulk-add-subscribers-to-forms.md · [2b] https://help.kit.com/en/articles/2502489-how-to-export-subscribers · [3] https://www.mailerlite.com/pricing · [4] https://www.mailerlite.com/help/how-to-use-double-opt-in-when-collecting-subscribers · [5] https://www.brevo.com/pricing/ · [6] https://www.brevo.com/legal/termsofuse/ (DPA section) · [7] https://www.beehiiv.com/pricing · [8] https://www.beehiiv.com/support/article/13081072798743 · [9] https://buttondown.com/pricing · [10] https://docs.buttondown.com/api-subscribers-create · [11] https://kit.com/dpa · [12] https://mailerlite.com/legal/data-processing-agreement · [13] https://www.beehiiv.com/dpa (last modified 16 Jul 2026) · [14] https://buttondown.com/legal/data-processing-agreement

Railway and CDN sources (checked 17 Nov 2026): https://railway.com/pricing · https://docs.railway.com/reference/pricing/plans · https://docs.railway.com/reference/usage-limits · https://docs.railway.com/networking/cdn · https://docs.railway.com/networking/public-networking/specs-and-limits · https://railway.com/legal/acceptable-use · https://railway.com/legal/fair-use · https://railway.com/legal/dpa · https://www.cloudflare.com/plans/free/
