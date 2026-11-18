# Security Audit: S00-1 site foundations (signup, headers, analytics consent) | Viktor | 2026-11-18

Verdict: FINDINGS - SEE BELOW. No critical or high findings. Two medium, four low.

Scope: branch feat/s00-1-content-first, uncommitted working tree as of 2026-11-18.
Files read: app/api/subscribe/route.ts, lib/kit.ts, lib/subscribe.ts, lib/rate-limit.ts,
lib/subscribe-client.ts, components/signup-form.tsx, next.config.ts, proxy.ts, lib/mdx.tsx,
lib/posts.ts, components/json-ld.tsx, app/feed.xml/route.ts, lib/copy.ts (consent and privacy
text), .gitignore, .env.example, package.json, .next build output (BUILD_ID 2026-11-18 12:30).
Values in .env.local were not read.

Supabase checklist: not applicable. The project has no Supabase (D-008).

---

## Findings

### F1. Request body is read without a byte cap | MEDIUM | owner: Tomas

Location: app/api/subscribe/route.ts, the `content-length` check and `await request.text()`.

Attack scenario: the 2 KB check trusts the declared `Content-Length`. A request sent with
`Transfer-Encoding: chunked` has no `Content-Length`, so `declared` is 0 and the check passes.
`request.text()` then buffers the whole body into memory before the `text.length` check runs.
Next.js applies no body limit to route handlers (`proxyClientMaxBodySize` covers proxy only, and
the proxy matcher does not include /api). Railway publishes no body size cap; it only says
"Request bodies must finish uploading within 5 minutes"
(https://docs.railway.com/networking/public-networking/specs-and-limits, read 2026-11-18).
One attacker can open 5 parallel uploads (the per-IP limit lets 5 through) of several GB each.
The single replica runs out of memory and the whole site goes down until Railway restarts it.
No data is at risk; availability of the entire site is.

Remediation (Tomas): read the stream with a running byte count and stop at the cap.

```ts
async function readCapped(req: Request, max: number): Promise<string | null> {
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}
```

Return 400 `invalid_email` (or 413) when it returns null. Keep the `Content-Length` pre-check as
a fast path. This also fixes a small mismatch: `text.length` counts UTF-16 units, while the
contract says bytes.

### F2. X-Real-IP trust is unproven on the live deploy | MEDIUM | owner: Phil (test on live), Quinn (script)

Location: app/api/subscribe/route.ts, `request.headers.get("x-real-ip")`.

Evidence, all read 2026-11-18:
- Railway docs list "`X-Real-IP` for identifying client's remote IP." They say nothing on
  whether a client-sent copy is replaced, and add "This information is subject to change at any
  time." https://docs.railway.com/networking/public-networking/specs-and-limits
- Railway employee (brody), 2026-05-06: X-Real-IP "is always set by our proxy", "We will always
  overwrite it", and "Apps behind our HTTP proxy cannot be accessed directly." The same thread's
  Railway reply says the docs "do not currently specify the exact overwrite/append semantics" and
  give no "formal anti-spoofing guarantee", and recommends X-Real-IP over X-Forwarded-For.
  https://station.railway.com/questions/need-authoritative-railway-client-ip-p-b7a7b4bd
- Railway moderator, 2026-09-09: X-Real-IP and X-Forwarded-For are "overwritten by Railway at the
  edge." A user replied on 2026-09-12 with a staging test where 11 requests, each with a different
  client-set X-Real-IP, all passed their per-IP limiter. No Railway employee reconciled this.
  https://station.railway.com/questions/supported-trust-model-for-client-ip-head-aafb68bc
- User report, 2026-06-18: X-Forwarded-For showed the same edge IPs for clients in different
  countries. Railway employee replied that the leftmost X-Forwarded-For value and X-Real-IP are
  the client IP; no fix was described.
  https://station.railway.com/questions/edge-cdn-layer-leaking-its-own-ip-as-cli-1ce29b05
- X-Envoy-External-Address appears in no Railway doc or employee answer I found. Do not use it.

Attack scenario, two failure modes:
1. Spoofable: an attacker sends a new random X-Real-IP on every request. The per-IP limit never
   fires, and one machine can hold the global cap (20 per minute) full. See F3 for what that
   costs.
2. Collapsed: the Railway CDN (D-005 turns it on) puts its own edge IP in the header. Many real
   visitors share one bucket, and 5 signups in 10 minutes from anywhere behind that edge node
   lock out the rest.

Remediation:
- Header to trust: `X-Real-IP`, as the code does now. It is the only header Railway documents for
  client IP, and Railway's own staff recommend it over X-Forwarded-For. Never fall back to the
  leftmost X-Forwarded-For value; if any hop appends, the leftmost value is whatever the client
  wrote.
- Keep the current "skip per-IP when the header is missing" behaviour. On Railway's public edge
  the header is always present, so the skip only fires off-platform. The service has no private
  networking neighbours today; if one is ever added, it could reach the app over
  `*.railway.internal` without the edge, so revisit then.
- Phil runs two tests on the first live deploy, CDN on, before announcing the site. Neither test
  calls Kit, because the limiter runs before validation (until F3 lands; after F3, see the note).
  Spoof test (from one machine):
  ```bash
  for i in 1 2 3 4 5 6; do
    curl -s -o /dev/null -w "%{http_code}\n" -X POST https://<domain>/api/subscribe \
      -H "Content-Type: application/json" -H "X-Real-IP: 203.0.113.$i" -d '{}'
  done
  ```
  Expected `400 400 400 400 400 429`. If the sixth is 400, the header is spoofable: tell Tomas,
  and raise it with Railway support.
  Shared-bucket test: send 5 requests as above (without the X-Real-IP line) from a laptop, then
  1 request from a phone on mobile data. Expected: the phone gets 400. If it gets 429, the CDN is
  collapsing IPs: tell Tomas.
  After F3 moves the global cap, the per-IP check still runs first, so the same tests still work.
- Wait 10 minutes after testing, or redeploy, to clear the buckets.

### F3. The global cap counts junk requests, so it is a cheap lockout lever | LOW | owner: Tomas

Location: app/api/subscribe/route.ts, `rateLimit("subscribe:global", ...)` runs before body
parsing, validation and the honeypot.

Attack scenario: any request, including `{}` and honeypot hits, uses up a global slot. To keep
real visitors out, an attacker needs 20 requests a minute. With a trustworthy X-Real-IP, the
per-IP cap (5 per 10 minutes) means that takes about 40 IPs, which a cheap residential proxy
service supplies. If F2's spoof test fails, it takes one laptop. Real visitors get "rate limited"
for as long as the attack runs. Nothing leaks and Kit is never called.

Judgement: the Kit quota guard is sound (Kit allows 120 requests per minute per key; a signup uses
3 calls once the tag id is cached). A one-minute lockout that clears on its own is acceptable for a
site with no revenue at week 1. Requests that never reach Kit should not spend Kit's budget, though.

Remediation (Tomas): move the global check to just before `subscribeToKit`, after the honeypot and
validation return. Keep the per-IP check where it is (cheap, runs before the body is read). With
that order, an attacker has to send valid-looking signups to fill the cap, and each one sends a
real confirmation email, which Kit's own abuse controls will notice. Optional: raise GLOBAL to 30
per minute (90 Kit calls, still under 120).

### F4. The form can be used to send repeated confirmation emails to a third party | LOW | owner: Tomas

Location: app/api/subscribe/route.ts and lib/kit.ts. Nothing limits signups per email address.

Attack scenario: someone who wants to annoy a person, or hurt Phil's sender standing, submits the
victim's address over and over. Each add-to-form for an unconfirmed subscriber can trigger another
double opt-in email (Kit's API docs do not say whether a repeat add resends; assume it does until
Quinn tests it). Per-IP limits slow this to 5 per 10 minutes per IP; across IPs it is capped only by
the global limit. Spam complaints count against Phil's Kit account.

Remediation (Tomas): after validation, add
`rateLimit(\`subscribe:email:${email}\`, 2, 24 * 60 * 60 * 1000)`. When it trips, return
`{ ok: true }` with 200 and skip Kit. Returning 200 keeps the response the same for new and
repeat addresses, so it adds no account enumeration. The 10,000-key bound in lib/rate-limit.ts
already covers memory.

Quinn: add a test case. Sign up a test address, do not confirm, sign up again. Record whether Kit
sends a second confirmation email.

### F5. No Content-Type or Origin check, so other sites can drive signups through visitors' browsers | LOW | owner: Tomas

Location: app/api/subscribe/route.ts. The handler parses any body as JSON.

Judgement on CSRF: there is no session or cookie, so classic CSRF gains an attacker nothing. Double
opt-in means a forged signup never puts anyone on the list without their click. The one real angle
is this: a hostile page can post a `text/plain` HTML form whose field name and value join into
valid JSON (`{"email":"victim@x.com","consent":true,"website":"","x":"` plus `"}`). The browser
sends it with no CORS preflight. Each visitor of that page then submits from their own IP, which
spreads F4's abuse across many real IPs and past the per-IP limit.

Remediation (Tomas): reject with 400 unless `Content-Type` starts with `application/json`. A
cross-site page cannot send that type without a preflight, and the route sends no CORS headers, so
the preflight fails. Also reject when `Sec-Fetch-Site` is present and is not `same-origin`. Both
checks cost two lines. Scripts outside a browser can still forge both, so treat this as a narrow
fix for browser-borne abuse only.

### F6. No Content-Security-Policy | LOW | owner: Yuki (next.config.ts)

Location: next.config.ts, `securityHeaders`.

Attack scenario: today there is no XSS sink fed by untrusted input (see sweep below), so a missing
CSP is not exploitable on its own. It matters as the second line when the first one fails: a future
tool page that renders fetched content (K03-T1 robots.txt tester) or a bad dependency.

Constraints, from the bundled Next 16 docs
(node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md):
- Nonces need dynamic rendering, and the docs state "Partial Prerendering (PPR) is incompatible
  with nonce-based CSP". This app uses `cacheComponents: true`, so nonces are out.
- The built HTML (.next/server/app/about.html) has 12 inline `<script>` blocks of streamed page
  data per page. Their content changes per page and per build, so hashes are impractical.
  Experimental SRI only covers external script files, so it does not solve this.
- Result: `script-src` needs `'unsafe-inline'`. That weakens the CSP against script injection.
  The policy still adds real value: it blocks framing, plugins, `<base>` hijack, off-site form
  posts and fetches to any host you did not list.

Fonts come from next/font (self-hosted under /_next/static/media). Share images from next/og are
served from the same origin. The JSON-LD block is `type="application/ld+json"`, a data block that
CSP does not apply to. No external origins are loaded by any page today.

Remediation (Yuki): add this to `securityHeaders` in next.config.ts.

```ts
const isDev = process.env.NODE_ENV === "development";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");
// { key: "Content-Security-Policy", value: csp }
```

Add analytics hosts once Phil picks an option (section below):
- Umami Cloud: add `https://cloud.umami.is` to `script-src`. Load the site once with DevTools
  open and add the host the script posts events to (Network tab) to `connect-src`.
- GA4 (Google's documented CSP for gtag.js): `script-src https://*.googletagmanager.com`;
  `img-src https://*.google-analytics.com https://*.googletagmanager.com`;
  `connect-src https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`.
  The inline gtag config snippet is already covered by `'unsafe-inline'`.

Check before commit: `pnpm build && pnpm start`, then open home, /blog, one post, one topic, /tools,
/newsletter (submit a test signup), a 404 and /blog/<slug>/opengraph-image. The console must show
zero CSP errors. Keep `X-Frame-Options: DENY` alongside `frame-ancestors` for old browsers.

---

## Questions answered

### Global cap as a lockout lever: acceptable?
Yes, after F3 moves it. See F3.

### Re-subscribing someone who unsubscribed
Kit's help centre, read 2026-11-18 (https://help.kit.com/en/articles/2502651-the-subscriber-profile-page-and-status):
unsubscribed people "can always resubscribe—by signing up for one of your Forms or Landing Pages",
"Kit requires explicit subscriber consent for all reactivations", automated reactivations through
the API are allowed "only when consent requirements are met", and "When an unsubscribed subscriber
resubscribes and confirms their subscription, their status will change to 'Confirmed.'"
Kit's API reference (create subscriber, add subscriber to form, read 2026-11-18) says create is an
upsert, that "Updating the subscriber state with this endpoint is not supported", and is silent on
what add-to-form does to a cancelled subscriber.

PECR and UK GDPR: a person who comes back, ticks the box and clicks the confirmation link has given
fresh consent. That is lawful, and the new consent tag records which wording they saw. The risk
would be a reactivation without the click. The code creates new people as `inactive` and relies on
the form's double opt-in, which is the right design. Two follow-ups:
- Quinn: unsubscribe a test address in Kit, sign up again through the site, and confirm the status
  stays Unsubscribed until the confirmation link is clicked. Record the result in the QA report.
- Phil: do not build a Kit automation that triggers on the `consent-...` tag. The tag lands before
  confirmation (by design in lib/kit.ts). Trigger welcome emails on form subscription instead.

### Can the API key reach the browser?
No. Checks:
- `lib/kit.ts` is imported only by app/api/subscribe/route.ts.
- `grep` of .next/static for `KIT_API_KEY`, `X-Kit-Api-Key` and `api.kit.com`: no hits.
- The server chunk contains `process.env.KIT_API_KEY?.trim()`, so the key is read at runtime and
  never inlined into the build.
- No `NEXT_PUBLIC_` variables exist anywhere in app/, lib/ or components/.
- `.env*` is git-ignored (`.gitignore` line 34), `.env.local` is ignored, and git history shows no
  committed env file or key-shaped value.
- Kit errors log step and status only. Responses carry error codes only, no stack traces.
Caveat: the build is from 12:30 and route.ts changed after it. Nothing in the later change touches
imports, so the result holds; Quinn's next build can re-run the grep.

### GA4 and cookie consent (Phil decides; not legal advice)
The law moved this year. The Data (Use and Access) Act 2025 added a "statistical purposes"
exception to PECR. Commentary puts commencement in February 2026 (5 February per several sources),
and the ICO finalised its storage and access guidance on 29 April 2026 (Osborne Clarke, 28 May 2026,
https://marketinglaw.osborneclarke.com/advertising-regulation/new-exceptions-explained-in-ico-final-guidance-on-storage-and-access-technologies-could-online-advertising-be-next/).

ICO "What are the exceptions?" page, read 2026-11-18 (no date shown on the page)
(https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/):
- the storage or access must have the sole purpose of collecting statistics about how the service
  is used, to improve it;
- you must give "clear and comprehensive information about the purpose" and "a 'simple and free'
  means to object";
- personal data must not be kept longer than the aggregation needs;
- "your third party provider must be a processor, not a joint controller", and you must tell users
  you use one;
- if any purpose falls outside the exception, you need consent for it.

What that means for GA4: default GA4 does not fit, because Google can use the data for its own
purposes through its data sharing settings and Google signals. A locked-down GA4 (all data sharing
settings off, Google signals off, no Ads links, granular location and device data off, retention at
2 months) plus an opt-out link is arguable, and commentators split on it. The ICO has not named
Google Analytics either way. I would not call it settled.

Options, lightest first:
1. Recommended: Umami Cloud Hobby. Free, 1 website, 100K events per month, 6 months retention, and
   Umami states it "does not use cookies" (https://umami.is/pricing, read 2026-11-18). It reports
   referrers, so the AI-referrer view in handoff item 10 still works (filter referrer by chatgpt,
   perplexity, gemini, copilot). Still fit it to the exception: say in the privacy notice that you
   use Umami for usage statistics, and add an opt-out link (Umami's tracker honours a disable flag
   set in the browser; Yuki can wire a one-click link on /privacy). No banner. Cost GBP 0, about
   30 minutes of setup, no ongoing admin. Trade-off: no GA4, so handoff item 10 needs Marcus to
   restate it as "analytics with AI-referrer view".
2. GA4 with no banner, locked down as above, plus opt-out link and privacy notice. GBP 0 and an hour
   of setup in the GA4 admin. Legal risk sits with Phil: the processor test is contested.
3. GA4 with a consent banner. gtag stays unloaded until the visitor clicks Accept (Consent Mode
   "basic"). Compliant beyond doubt, but a banner on every first visit, a share of visitors refusing
   so the numbers undercount, and one more component to keep working. A home-made banner is about
   half a day of build; a hosted consent tool usually means a paid tier or a branding badge.

Whichever Phil picks, Margot rewrites the "Cookies and analytics" section of the privacy notice
(lib/copy.ts) before the script goes live, and Yuki adds the hosts to the CSP in F6.

---

## Sweep results (checked, nothing found)

- Dependencies, `pnpm audit` 2026-11-18: 2 high (picomatch ReDoS, GHSA-fc5q-39xc-vjpf) and
  1 moderate (minimatch, GHSA-g3hv-75wg-m249). All paths run through the shadcn CLI and eslint
  tooling. Nothing at runtime passes an attacker's glob pattern to them. Not exploitable. See
  hardening note on moving `shadcn` to devDependencies.
- `cn@0.5.2`: unusual name, so I checked it. Maintainer `shadcn`, repo github.com/shadcn-ui/cn, no
  install scripts. Legitimate.
- MDX: `evaluate()` runs post code at build, which is safe only because posts are Phil's own files
  in git (lib/mdx.tsx says so). Current posts contain no imports, exports, raw HTML or script.
  Rule for the team: never feed MDX from any outside source into `renderMdx`.
- JSON-LD (components/json-ld.tsx): `JSON.stringify` with `<` escaped to `<`. Cannot break out
  of the script tag. Inputs are post frontmatter and site config anyway.
- RSS (app/feed.xml/route.ts): all text fields XML-escaped.
- proxy.ts: slugs are matched against an in-memory list, never used as a file path. No traversal.
- Drafts: hidden in production unless `SHOW_DRAFTS=true`. Make sure Railway does not set it.
- Account enumeration: new and existing addresses both return `{ ok: true }`.
- Validation (lib/subscribe.ts): length is checked before the regex, so the email regex cannot be
  driven into slow backtracking.
- Existing headers: HSTS, nosniff, Referrer-Policy, X-Frame-Options DENY, Permissions-Policy and
  no `X-Powered-By`. Fine.
- `.gitignore` covers `.env*` and `*.pem`. keyword-shortlist-and-content-plan.xlsx: scanned its
  strings for email addresses and credentials; none found, so committing it is a content call only.

## Hardening notes (not findings)

- lib/kit.ts: add `import "server-only";` as the first line (Tomas). The package is already a
  dependency and lib/posts.ts uses it. A future client import of lib/kit.ts then fails the build
  instead of shipping the key reader to the browser.
- package.json: move `shadcn` to devDependencies (Yuki). It is a CLI used at dev time, and it
  carries all three audit hits into the production install.
- next.config.ts: add `Cross-Origin-Opener-Policy: same-origin` (Yuki). No popups or OAuth flows
  depend on cross-origin windows.
- HSTS: once the domain is live and stable on HTTPS for both apex and www, consider `preload`.
  Phil's call, because preload is hard to undo.
- If signups are abused despite F3 and F4, add Cloudflare Turnstile (free) to the form. It adds a
  third-party script, CSP hosts and a privacy notice line, so hold it until there is a need.
- When the robots.txt tester (K03-T1) lands, it fetches user-supplied URLs. That needs its own pass
  for SSRF (block private, link-local and Railway internal ranges after DNS resolution, cap
  redirects, size and time). Flag me before it ships.

## Who does what

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| F1 | MEDIUM | Tomas | Byte-capped body reader |
| F2 | MEDIUM | Phil (live test), Quinn (script) | Run spoof and shared-bucket tests on first live deploy |
| F3 | LOW | Tomas | Move global cap after validation and honeypot |
| F4 | LOW | Tomas, Quinn | Per-email limit 2 per 24h; test repeat confirmation emails |
| F5 | LOW | Tomas | Require application/json; reject cross-site Sec-Fetch-Site |
| F6 | LOW | Yuki | Add CSP from this report; add analytics hosts after Phil's choice |
| GA  | decision | Phil, then Margot and Yuki | Choose option 1, 2 or 3; rewrite privacy section; wire opt-out |
| Kit | test | Quinn, Phil | Re-subscribe test; no automations on the consent tag |

---

## Umami verification (2026-11-18)

Scope: Phil chose Umami Cloud Hobby (option 1 above). This section checks the claims in option 1
against Umami's own docs, policies and source, and audits the wiring already in the tree:
lib/analytics.ts, components/analytics-script.tsx, components/analytics-opt-out.tsx,
components/signup-form.tsx, components/tracked-link.tsx, and the "Cookies and analytics" copy in
lib/copy.ts.

Sources (all read 2026-11-18; none of the docs pages shows a date unless noted):
- [SRC] github.com/umami-software/umami, main at commit aad2c4c (17 Nov 2026), version 3.5.0.
  Files: src/lib/crypto.ts, src/lib/collection-session.ts, src/app/api/send/route.ts,
  src/lib/ip.ts, src/tracker/index.ts, src/queries/sql/funnels/getFunnel.ts, src/lib/schema.ts,
  src/app/(main)/websites/[websiteId]/(reports)/funnels/FunnelEditForm.tsx.
- [LIVE] https://cloud.umami.is/script.js as served 2026-11-18 13:25 GMT (last-modified
  17 Nov 2026 23:44 GMT, 9,322 bytes).
- [METRICS] https://docs.umami.is/docs/metric-definitions
- [ENV] https://docs.umami.is/docs/environment-variables
- [TRACKER] https://docs.umami.is/docs/tracker-configuration
- [FUNNEL] https://docs.umami.is/docs/funnel
- [CLOUDFAQ] https://docs.umami.is/docs/cloud/faq
- [SIGNUP] https://docs.umami.is/docs/cloud/sign-up
- [PRICING] https://umami.is/pricing
- [PRIVACY] https://umami.is/privacy (last updated 19 October 2026)
- [DPA] https://umami.is/dpa (last updated 2 August 2026)
- [SUBP] https://umami.is/subprocessors (last updated 24 April 2026)
- [ADBLOCK] https://docs.umami.is/docs/bypass-ad-blockers
- [ICO] ICO "What are the exceptions?", URL as in the GA4 section above.

Verdict for this section: Umami Cloud fits the PECR statistical purposes exception if Phil picks
the EU region and the copy and wiring changes below land. No critical or high findings. One medium
(privacy notice understates what is recorded), two low, and hardening notes.

### 1. How Umami tells visitors apart, and the Monday-to-Thursday question

What is hashed [SRC src/lib/collection-session.ts, `resolveCollectionSession`]:

```ts
const baseSalt = getSalt(process.env.SALT_ROTATION, createdAt);
const sessionId = uuid(sourceId, ip, userAgent, sessionSalt, distinctId ?? '');
```

`uuid(...)` is `v5(hash(...args, secret()), v5.DNS)` and `secret()` is a hash of the server's
APP_SECRET [SRC src/lib/crypto.ts]. So the session ID is a UUIDv5 of: website ID, IP address,
full User-Agent string, the period salt, an optional distinct ID (we do not set one) and the
server secret. [METRICS] says the same in prose: "hashing the website ID, visitor IP address,
browser User-Agent, and a rotating salt".

Salt rotation: monthly, at the start of each UTC month. [SRC crypto.ts `getSalt`]: when
SALT_ROTATION is unset it returns `hash(startOfMonth(createdAt).toUTCString())`. [ENV]: "The
default is `month`". [METRICS]: "The salt rotates monthly by default", and only "self-hosted
installations" can change it. Umami does not publish the value Cloud runs with. Everything on
their pages points to the monthly default; I treat that as likely, unconfirmed.

A visit (one sitting) is a second hash of the session ID with an hourly salt, and a new visit
starts after 30 minutes with no events (`now - iat > 1800` in collection-session.ts; [METRICS]).

Point for the privacy copy: the "salt" is derived from the calendar month, plus a server secret.
It is not random. Whoever holds APP_SECRET (Umami) can recompute the session ID for a known IP and
browser for any past month. That makes the ID pseudonymous. Do not call it "anonymous" in the
privacy notice. "A code that changes every month" is accurate.

Monday tool use, Thursday signup: Umami counts this as one visitor only if all of these hold:
- same IP address on both days;
- byte-identical User-Agent (a browser auto-update between Monday and Thursday changes it);
- both days fall in the same UTC calendar month;
- the funnel window is at least the gap between the steps (see section 5).

In practice that fails often. Phones move between Wi-Fi and mobile data, mobile carriers rotate
IPs, and many home IPv6 connections rotate addresses daily. It also over-merges: people behind one
office or carrier IP with the same browser build collapse into one "visitor". Treat any
multi-day funnel as noisy and low. Same-sitting funnels (tool, then signup within an hour) are
reliable.

Recommendation for attribution (Yuki): add the tool slug to the signup event when the form sits on
a tool page, for example `signup: { placement: "tool_page", tool: "<slug>" }`. That answers "which
tool earns signups" for same-visit signups with no device storage. For delayed signups, accept the
gap. A "last tool used" value kept in localStorage would close it, but it is a new device-storage
use that needs its own line in the privacy notice and must be wiped by the opt-out. Not worth it
at this stage. Do not use `data-distinct-id` or `umami.identify()`. Those link visits across
months and would tie analytics to a person.

### 2. What the tracker stores on the device, and the opt-out

The tracker writes nothing to the device. In [SRC src/tracker/index.ts] the only storage call is
`localStorage?.getItem('umami.disabled')` inside `trackingDisabled()`. There is no `setItem`, no
sessionStorage use and no `document.cookie`. [LIVE]: zero `setItem` calls; `umami.disabled`
present. The cache token Umami returns (`x-umami-cache`) lives in a JavaScript variable and dies
with the tab. Umami FAQ: "Umami's web tracker does not use cookies"
(https://docs.umami.is/docs/faq).

It still reads from the device, which PECR counts as access: the localStorage flag, screen size,
browser language and the Do Not Track setting (`getPayload()` and `hasDoNotTrack()` in
index.ts), and the browser sends the User-Agent. That is why the site needs the statistical
purposes exception even though it sets no cookies.

Opt-out mechanism: `trackingDisabled()` runs before every send, so any truthy value under
`umami.disabled` stops the next event and every one after it, with no reload. lib/analytics.ts
sets `"1"` and removes the key to opt back in. Matches the source. Yuki's `track()` also checks
the flag before calling Umami. Good.

Is writing the opt-out flag itself fine under PECR? Yes, on two grounds.
- The statistical exception requires "a simple means of objecting, free of charge" and that you
  stop when someone objects [ICO]. A stored flag is the mechanism the law asks for.
- [ICO], strictly necessary: persistent storage that remembers "the user's cookie preferences over
  a period of time (eg 90 days), can be exempt", given sufficient information "in a prominent
  location". The flag holds the fixed value "1", no identifier, and is written only when the
  visitor clicks. The browserNote copy already tells them.

### 3. Data location, DPA, sub-processors, IP storage

- Region: "Umami Cloud offers US and EU data regions, selected during account setup" and "The
  data-region selection applies to analytics storage." CDN routing, security, support and
  operational logging "may involve services outside it". The region field is read-only after
  setup [CLOUDFAQ]. [SIGNUP]: setup step "Select data region", "Choose the US or EU data region".
  [PRICING] FAQ: "servers are located in the US and EU".
- DPA: "Customer is the Controller of Customer Personal Data and Umami is its Processor" (s2.1);
  Umami processes only "on Customer's documented instructions" (s2.3); accepted on account
  creation, "A separately signed copy is not required" [DPA]. The DPA does not mention plan tiers;
  it applies to Cloud accounts and excludes self-hosted use. Transfers: no restricted transfer
  without a valid mechanism, naming EU SCCs and the UK Addendum (s10.1). New sub-processors get
  at least 15 days' notice (s7.3).
- Residual risk on the processor test: s2.2(1) instructs Umami to process data "to provide,
  maintain, secure, support, and improve the Services". A processor improving its own product with
  customer data is a grey area. [PRIVACY] says customer analytics data is processed "on their
  behalf under the Data Processing Agreement" and does not claim controller use of it. I rate this
  acceptable. The same clause sits in most SaaS DPAs, and the ICO has not named it as breaking the
  exception.
- Sub-processors [SUBP]: AWS, Axiom (logging), Cloudflare (CDN), Vercel (hosting), Upstash,
  Anthropic and OpenAI (generative AI services), Google, Resend, Salesforce, Stripe, Discord, all
  USA; ClickHouse (USA/EU); Hetzner (EU). [LIVE] confirms the script is served via Cloudflare and
  Vercel (London edge, `lhr1`).
- IP addresses: "Umami's standard analytics do not store visitor IP addresses as fields in
  analytics records", and IPs are "processed transiently to deliver requests, calculate visitor
  identifiers, and derive approximate location". Umami and its providers "may also record IP
  addresses in operational and security logs", retention not stated [PRIVACY]. Source agrees: the
  session row holds browser, OS, device, screen, language, country, region and city, with no IP
  field (`createSession` call in src/app/api/send/route.ts).

### 4. Fit with the PECR statistical purposes exception

Condition by condition, against [ICO]:

| ICO condition | Status |
|---|---|
| Sole purpose is statistics to improve the service | Met if no Google Ads integration, no session replay, no error capture (see Phil's list) |
| Clear and comprehensive information about the purpose | Not met yet: see finding U1 |
| Simple and free means to object | Met by /privacy toggle; needs a sitewide link (U2) |
| Stop when someone objects | Met: flag checked before every send |
| Do not rely solely on browser settings | Met: DNT is an extra, the toggle is the main route |
| Provider is a processor, not a joint controller | Met per [DPA] s2.1, with the s2.2(1) caveat above |
| Keep individual-level data no longer than needed | 6 months on Hobby [PRICING], [CLOUDFAQ]. Arguable. Phil can reduce it by deleting data, see his list |

Do Not Track: keep `data-do-not-track="true"` (already set). It costs nothing and honours a
stated preference. Be aware it covers few people now: the ICO says not to rely on browser settings
alone, which we do not. Global Privacy Control is the live signal in Firefox, Brave and some
extensions, and Umami does not check it. Add a GPC check in a before-send hook (section 6).

#### U1. The privacy notice understates what Umami records | MEDIUM | owner: Margot

Location: lib/copy.ts, `privacyBody`, "Cookies and analytics" list and `analyticsFacts`.

Scenario: the ICO exception needs "clear and comprehensive information". The list says "your
country". Umami stores region and city too, plus screen size, language and OS, and the site sends
custom events (signups, signup errors, follow clicks, tool runs). Query strings and UTM tags are
recorded unless stripped. A visitor or the ICO who compares the notice with the Umami dashboard
finds the notice incomplete, which removes the footing for the exception. The fix is copy only.

Remediation (Margot), facts the section must state. Wording is Margot's:
- What is recorded per visit: page address and title, the site you came from (and campaign tags
  if the link had them), browser and its version, operating system, device type, screen size,
  language, and country, region and city worked out from your IP address.
- What actions are counted: signing up (and where the form was), signup errors, clicks on the
  social links, and using a tool. Say no form contents, email addresses or text you type are sent.
- How visitors are told apart (`analyticsFacts.identification`): Umami makes a code from your IP
  address, your browser details and a value that changes every month. It does not store your IP
  address with your visits. The code changes at the start of each month, so Umami cannot link this
  month's visits to last month's. Nothing is stored on your device unless you opt out. Avoid the
  word "anonymous".
- Where (`analyticsFacts.location`), assuming Phil picks EU: Umami stores the visit data in the
  EU. Umami is a US company and some of its service providers are in the US, for example for
  hosting and support. Transfers from the UK are covered by the UK Addendum to the EU standard
  contractual clauses in Umami's data processing agreement.
- Umami and its providers may keep IP addresses in short-term security logs [PRIVACY]. One plain
  sentence.
- "This site sets no cookies" stays true. Add that if you opt out, the site saves one setting in
  your browser to remember that, and that this is the only thing it stores on your device.
- Legitimate interests as the UK GDPR basis: unchanged, still Phil's to confirm.
- Retention stays "6 months" (plan limit), unless Phil deletes earlier.

#### U2. The opt-out lives only on /privacy | LOW | owner: Yuki

Location: app/privacy/page.tsx, components/analytics-opt-out.tsx; no link in the footer.

Scenario: [ICO] asks for a "simple" means to object. A visitor who wants out has to find the
privacy page and scroll to the end. That is likely enough, and it is the weakest part of the
setup. A footer link costs one line.

Remediation (Yuki): add a footer link on every page to `/privacy#opt-out`, label agreed with
Margot, and give the opt-out block `id="opt-out"`. The toggle must work without login or reload,
show its current state, and allow opting back in. It does all three now.

### 5. Funnels

- Steps can be URLs, URL prefixes with a trailing wildcard, or events, mixed freely. [SRC
  src/lib/schema.ts]: `type: z.enum(['path', 'event'])` per step. [FUNNEL]: "Specific URL",
  "Event", "URL wildcards". Event steps can filter on event properties (`filters` with eq, neq,
  contains, does-not-contain), so "signup where placement = tool_page" works as a step.
- Steps: minimum 2 [FUNNEL]; maximum 8 in the UI (`FUNNEL_STEPS_MAX = 8` in FunnelEditForm.tsx).
- Window: "Maximum number of minutes allowed between consecutive funnel steps" [FUNNEL]. It is
  measured from the previous step, not from the first (`we.created_at between l.created_at and
  l.created_at + window` in getFunnel.ts). UI default 60 minutes; the API accepts any positive
  number (schema.ts), so 4,320 minutes (3 days) is allowed.
- Counting is by session ID (`count(distinct(session_id))`), so the limits in section 1 apply in
  full. Order matters; other pages and events in between are allowed [FUNNEL].

### 6. Tracker options and CSP

Already set in components/analytics-script.tsx: `data-website-id`, `data-domains` (live hostname
from SITE_URL), `data-do-not-track="true"`, production only. Correct. Notes:
- `data-domains` is an exact match on `window.location.hostname`; "www matters" [TRACKER]. If both
  apex and www serve pages without a redirect, the other one sends nothing. Phil should redirect
  one to the other at the DNS or Railway level. Fail-closed, so not a finding.
- `data-exclude-hash="true"`: add. The site has no use for fragments.
- Query strings: `data-exclude-search="true"` would also drop UTM tags, which Umami extracts on the
  server from the URL (route.ts reads `utm_source` and friends from `currentUrl`). Phil will want
  UTMs on TikTok, YouTube and X links. Better: a before-send hook that keeps only `utm_*`
  parameters and drops the rest. That stops future tool pages leaking user input through query
  strings (a robots.txt tester with `?url=...`, for example).
- Before-send hook [TRACKER]: `data-before-send="<global function name>"`. The function receives
  `(type, payload)`, may return a changed payload, and a falsy return cancels the send. It is looked
  up on every send (`getBeforeSend()` in index.ts), but it must exist before the first page view,
  so define it in a small inline script placed before the tracker (already allowed by
  `'unsafe-inline'` in the F6 CSP). Hook behaviour:
  - if `navigator.globalPrivacyControl === true`, return null (honour GPC);
  - rewrite `payload.url` and `payload.referrer` (when same-site) to keep only `utm_*` params;
  - return the payload.
- Leave off: `data-performance` is fine to add later (Core Web Vitals are statistics). Keep
  `data-errors` off: error messages can carry user input. Never load Umami's session recorder
  (rrweb-based, src/recorder in the repo): it records form fields and falls outside the exception.
- `data-salt-rotation`: has no effect on Cloud unless Umami enables ENABLE_CLIENT_SALT [ENV], which
  they do not document. Do not set it.

CSP for F6 (Umami Cloud, no proxy):
- `script-src` add `https://cloud.umami.is`
- `connect-src` add `https://gateway.umami.is`. [LIVE] script posts to
  `${host || "https://gateway.umami.is"}/api/send`.
- Phil picks EU at signup; the script is the same for both regions in [LIVE], but confirm in
  DevTools on the first production load that the POST goes to gateway.umami.is. If it goes
  elsewhere, add that host instead.

#### U3. Third-party script runs with full page access, including the signup form | LOW | owner: Yuki

Location: components/analytics-script.tsx, `src="https://cloud.umami.is/script.js"`.

Scenario: anyone who compromises cloud.umami.is, Umami's Vercel project or its Cloudflare zone can
serve JavaScript that reads the email field on every signup form and posts it anywhere `connect-src`
allows, or anywhere at all until F6 lands. The file is mutable (last modified 17 Nov 2026 per
[LIVE]), so Subresource Integrity would break on each Umami release. Needs a supplier compromise,
hence low.

Remediation (Yuki), pick one:
- Self-host a pinned copy: save the script into public/ (for example /a/u.js), load it from
  'self', drop `https://cloud.umami.is` from `script-src`, keep `https://gateway.umami.is` in
  `connect-src`. Re-pull it every few months. [ADBLOCK] documents hosting the script yourself as a
  supported option. This also removes the script request to a third party for opted-out visitors.
- Or keep the remote script and land F6 so `connect-src` limits where a bad script can post.
  Either way, land F6.

Hardening (Yuki): the script still downloads for opted-out visitors, which sends their IP to
Umami's CDN. The opt-out is honoured because nothing is posted, so this is not a finding. If
self-hosting, it goes away. If not, a client wrapper can skip injecting the script when
`isOptedOut()` is true.

### 7. Proxying the script and collect endpoint through our domain

My view: do not proxy at launch.

- Law: an ad blocker is not the objection mechanism PECR requires; our toggle is. So proxying is
  not unlawful on its face. But the people running blockers have taken a step to avoid tracking,
  and DNT and GPC signals are already honoured on that same reasoning. Getting round their tool is
  hard to square with that.
- Trust: the site teaches small businesses how to be trusted online. "This site routes its
  analytics through its own domain to get past blockers" reads badly if someone spots it in the
  network tab, and someone will.
- It breaks the numbers unless done with care. Umami uses the request IP for the session ID. A
  Next.js rewrite on Railway sends Railway's IP unless the real client IP is forwarded, and Umami
  only trusts its own `x-umami-client-ip` header when it runs in cloud mode (src/lib/ip.ts
  `IP_ADDRESS_HEADERS`), which is not documented for customers. Get it wrong and every visitor on
  one browser build becomes one session, which wrecks visitor counts and funnels.
- It adds a line to the privacy notice (traffic passes through our server and its logs) and IP
  handling to Railway logs.

If blocked traffic turns out to matter: compare Umami page views with Railway request logs for a
fortnight. If more than about a third is missing and decisions suffer, revisit, starting with the
self-hosted script in U3, and disclose any proxy in the notice.

### Checklists

Margot (privacy copy, lib/copy.ts):
- Fill `analyticsFacts.identification` and `analyticsFacts.location` with the facts in U1.
- Extend the "For each visit" list per U1, and add the list of counted actions.
- Add the one-setting-in-your-browser sentence and the security-logs sentence.
- No "anonymous". Keep "processor", "6 months" and "legitimate interests" (Phil confirms).
- If Yuki adds the GPC and DNT behaviour, say: "If your browser sends a Do Not Track or Global
  Privacy Control signal, your visits are not counted."
- Label for the footer opt-out link (U2).

Yuki (build):
- Add `data-exclude-hash="true"` and a before-send hook (GPC check, keep only `utm_*` in URL and
  same-site referrer). Define the hook before the tracker loads.
- Add `tool: <slug>` to the `signup` event on tool pages. No `data-distinct-id`, no `identify()`,
  no `data-errors`, no session recorder. Event properties stay closed enumerations, as now.
- Land F6 with `script-src https://cloud.umami.is` and `connect-src https://gateway.umami.is`
  (or 'self' only for the script if self-hosting per U3).
- Footer link to `/privacy#opt-out`; `id="opt-out"` on the toggle block (U2).
- U3: self-host a pinned script, or skip loading for opted-out visitors.
- Verify in production with DevTools: one POST to gateway.umami.is per page view; none after
  opting out; none with GPC on; none on a Railway preview URL; zero CSP errors.

Phil (Umami dashboard and setup):
- At account setup choose the EU data region. It cannot be changed later without support
  [CLOUDFAQ]. Check it under Settings, Account, Data region.
- Save a PDF of umami.is/dpa (2 August 2026 version) and umami.is/subprocessors with today's date
  for your records. Watch for the 15-day sub-processor notices.
- Add the website with the exact production hostname (apex or www, whichever you redirect to).
- Do not connect the Google Ads integration. It sends data to Google for advertising and breaks
  the sole-purpose test. Search Console import is inbound only and fine.
- Use IP Filters (https://docs.umami.is/docs/cloud/ip-filters) to exclude your own IP so your
  testing does not count.
- Do not turn on public share links for the dashboard.
- Optional, privacy-positive: Umami Cloud keeps 6 months on Hobby. If you want shorter, export
  then delete older data periodically. Not required at this stage.
- Build the "tool to signup" funnel with a 60-minute window. Use a multi-day window only as a
  rough signal, per section 1.

Who does what (Umami):

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| U1 | MEDIUM | Margot | Complete the analytics facts in the privacy notice |
| U2 | LOW | Yuki | Sitewide opt-out link |
| U3 | LOW | Yuki | Self-host pinned script or rely on F6 connect-src |
| Umami setup | task | Phil | EU region, DPA copy, IP filter, no Google Ads link |
