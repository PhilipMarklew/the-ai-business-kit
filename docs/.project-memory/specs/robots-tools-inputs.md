# robots.txt tools: inputs for Marcus's spec (K03-T1 tester and K08-T1 generator)

Source: keyword-shortlist-and-content-plan.xlsx (git-ignored, local), sheet Backlog. Copied 2026-11-19.
Phil wants one spec that covers both tools (2026-11-19). They stay two pages at two URLs, because each targets its own search query. They share the bot data file and link to each other.

## K03-T1 tester: backlog brief (key lines)
- Name: robots.txt tester with AI-bot checks. Free tool. Est 12 hrs. Status Idea. Week plan: W2-3.
- Target queries: robots.txt tester; robots.txt checker; robots.txt validator; test robots.txt; robots.txt block chatgpt.
- Searcher: site owner or developer checking if a URL is blocked.
- Inputs and behaviour: domain + a URL path. Server route fetches /robots.txt (SSRF protections: block private IPs, size and time limits, rate limit), parses the rules, shows allowed or blocked per bot, highlights syntax issues.
- Bots in brief: Googlebot, Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended.
- Page: /tools/robots-txt-tester.
- Why it can rank: Google retired its own tester (verify the date before writing). Small tools rank (Spotibo, Swetrix, SE Ranking, GEO Toolbox). Win on AI-bot checks and clear explanations per result.
- Links: pillar K03-B1, AI crawler generator K08-T1, data study K08.
- Email hook: emailed pack of copy-paste AI-bot rules for the common choices ("AI-bot rules pack"; does not exist yet).

## K08-T1 generator: backlog brief (key lines)
- Name: AI crawler robots.txt generator (choose allow or block per bot). Free tool. Est 6 hrs. Status Idea. Week plan: W5-6.
- Target query: how to block ai crawlers. Secondary: how to block gptbot; should i block ai crawlers; robots.txt block chatgpt; block ai bots.
- Searcher: site owner who wants copy-paste rules.
- Behaviour: checkboxes grouped by purpose. Training crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended and others), AI search crawlers (OAI-SearchBot, PerplexityBot), user-triggered fetchers (ChatGPT-User). Presets: Block training only, Block all AI, Allow all. Outputs robots.txt rules plus platform notes (Cloudflare toggle). Runs in the browser, no server route.
- Page: /tools/ai-crawler-robots-txt-generator.
- Keep the bot list in one data file that is easy to update.
- Why it can rank: explain the difference between training, search and user-triggered bots (blocking the wrong one removes a site from AI search). Include a step that sends the reader to the tester to check the result. State that robots.txt is a request and some bots ignore it.
- Links: pillar K08-B1, tester K03-T1. Cloudflare notes can link K08-B5 and K08-B6.
- Email hook: AI-bot rules pack and a monthly bot-list update email.

## Questions the spec should answer
- Bot data file shape: fields both tools need (token, vendor, group, docs URL, date checked, notes such as the Google-Extended trade-off).
- Generator to tester hand-off: can the generated file be passed to the tester (paste mode) without a server fetch? A paste mode in the tester would also let people test a file before it goes live.
- Build order inside the spec: the shared data file first, then which tool. Launch needs the tester (D-017); the generator is the fallback if Phil wants to go live within about 2 weeks.

## Phil's idea: one flow across both tools (2026-11-19)
- Test, then fix: tester results offer "Fix this", which opens the generator with ticks preset from the file's current rules. The reader adjusts, copies, then checks the new file in the tester's paste mode before uploading.
- Generator visitors enter at the generator and use the same check step.
- Input priority: URL fetch is the main input. In the flow, files pass between the tools in the browser, so the reader never pastes. Paste mode is a small fallback link ("Or paste a file") for fetches that get blocked (for example by Cloudflare bot protection), sites that are not public, and files not yet uploaded. Pasted text needs no server fetch, so it carries no SSRF risk.
- Keep two URLs with one shared tool component. Each page has its own starting point, H1, intro copy and canonical.
- Key risk: the generator must merge, never replace. Parse the existing file, change only the AI-bot groups the reader ticked, keep every other line (Disallow rules, Sitemap lines, other crawlers), and show a diff. Handle shared User-agent groups and a `User-agent: *` that blocks everything. Needs unit tests (rough extra 3-4 hrs).
- Folder layout Phil agreed in principle (2026-11-19): shared UI in a private folder app/tools/_robots/ (never routed); each page folder (robots-txt-tester, ai-crawler-robots-txt-generator) holds only page.tsx with its own H1 and intro and renders the shared tool with a different start; logic in lib/robots/ (bots.ts, parse.ts, merge.ts, fetch.ts server-only, plus tests); server fetch at app/api/tools/robots-txt-tester/route.ts. Slug stays robots-txt-tester, which matches the target keyword.
- Spec should give two launch options: tester with paste mode first and "Fix this" later, or both together with a later launch date.

## Decisions and facts the spec must use
- Tools stay in this Next.js app (D-003, D-017): app/tools/robots-txt-tester/page.tsx, app/api/tools/robots-txt-tester/route.ts, lib/tools.ts entry, shared tools layout.
- Shared AI-bot data file in lib/, used by the tester and the K08-T1 generator. Seed from app/robots.ts and the D-015 groups: training (GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended), search (OAI-SearchBot, PerplexityBot, Claude-SearchBot), user-triggered (ChatGPT-User, Claude-User).
- SSRF protections and rate limiting: D-007 (lib/rate-limit.ts, in-memory per IP, X-Real-IP). Viktor audits the route before launch.
- HTTP status per bot: report the status each bot user agent receives. Caveat to show: requests from this server only pretend to be the bot. Cloudflare verifies real bots by IP, so real bots can get a different answer. See K08-B7 in specs/content-briefs-robots-cloudflare.md.
- First test case is this site (D-015): live robots.txt is app/robots.ts only; training bots get 403 at the Cloudflare edge, search and agent bots get 200.
- Analytics event tool_run exists in lib/analytics.ts (D-013).
