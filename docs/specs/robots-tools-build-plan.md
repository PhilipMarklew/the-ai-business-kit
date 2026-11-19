# Spec: robots.txt tester and AI crawler generator, build plan
Date: 2026-11-19 | Author: Marcus | Status: Draft | Spec ID: S-002

## Summary

This plan covers two free tools that share one set of code. The robots.txt tester (backlog K03-T1, page `/tools/robots-txt-tester`) fetches a site's robots.txt and checks it for mistakes. It then says which bots may visit a given page. The AI crawler generator (backlog K08-T1, page `/tools/ai-crawler-robots-txt-generator`) lets a reader tick which AI bots to block and gives back an updated file.

Phil builds both. The shared logic comes first. The tester follows, because launch needs it (D-017). The generator and the link between the two tools come last.

How to use this plan:
- Work through the steps in the "Tasks" section in order. Each step says what to build and why it is built that way. It then says how you know it is done and roughly how long it takes.
- Steps 1 to 10 get the tester live. Steps 11 to 14 add the generator.
- Terms are explained the first time they appear. Short code shapes appear only where words alone would leave room for doubt.

Time: about 20 hours for the tester and 10 for the generator. The backlog said 12 and 6. Most of the gap goes on unit tests and the safety work around the server fetch. The HTTP status check adds the rest. At 6 hours a week, the tester plus the three launch posts (6.5 hours) takes about 4 weeks. See decision D10 and open question Q1.

## Assumptions

Phil can veto any of these.

- A1. Phil builds every step, so the Owner column says "phil". Viktor audits the server fetch before launch (step 10). Margot can do a copy pass on page text.
- A2. In the generator each AI bot has two settings. "Block" writes `Disallow: /` for that bot. "Allow" means the bot follows the rules the file sets for all bots (the `User-agent: *` group). The generator never writes partial rules for one bot, such as blocking GPTBot from `/blog` only. Anyone who needs that edits the file by hand, and the generator leaves those hand-written lines alone.
- A3. The tester has one input box: a full page address such as `https://example.com/blog/post`. The tool works out the robots.txt address and the path from it. A bare domain means the path `/`. This covers the brief's "domain plus path" with one box less.
- A4. The tester judges rules the way RFC 9309 says. RFC 9309 is the written standard for robots.txt, and Google follows it. Where Google differs (it ignores `Crawl-delay`, it stops reading after 500 KiB), the tester says so in a note.
- A5. The site runs as one Railway replica (D-007). So the in-memory rate limiter in `lib/rate-limit.ts` is enough, and so is a plain counter for how many outside requests run at once.
- A6. No database. Nothing a reader types is stored. The server fetches the file and passes it to the browser. It keeps no copy. Supabase has no job here.
- A7. No FAQ structured data and no llms.txt on these pages (CLAUDE.md).
- A8. The estimates assume Phil knows Next.js and TypeScript well and has not written a server fetch guard before.

## Decisions

### D1. The browser reads and judges the file; the server only fetches it

What: the server route fetches robots.txt and returns the raw text plus facts about the fetch (status code, redirects, content type). All parsing and rule checks run in the browser.

Why: the tester has two inputs, a fetched file and a pasted file. If the browser does the parsing, both inputs go through the same code. The generator also runs in the browser and needs the same parser. The server route stays small, which makes Viktor's audit smaller too.

Rejected: parsing on the server and returning results. That gives two code paths (server for fetched files, browser for pasted ones) that can drift apart. The parser adds a few KB to the browser bundle (the JavaScript sent to the visitor), which is fine.

### D2. Two page folders, two main client components, shared parts in a private folder

What: all robots tools code lives in `app/tools/_robots/` (see D11 for the layout). Next.js never turns a folder that starts with `_` into a URL. Each page folder holds only `page.tsx`. Phil's note said one shared tool component with a different start on each page. This plan changes that to two main components, `TesterTool` and `GeneratorTool`, built from shared parts.

Why: the two screens have little in common. The tester shows a results table and a list of problems. The generator shows checkboxes and a diff. One component with a "mode" switch would be two components hidden behind an `if`. The parts that are truly shared (the bot table, the file input, the diff view, the hand-off helper) live in `app/tools/_robots/ui/` and both tools use them.

Rejected: one `RobotsTool` with a `mode` prop. It saves no code and makes each screen harder to read.

### D3. Write the parser and the rule checker by hand

What: `app/tools/_robots/logic/parse.ts` reads the file line by line. `app/tools/_robots/logic/match.ts` answers "may this bot fetch this path?".

Why: the tester must point at the exact line that causes a problem. The generator must change some lines and keep every other line as it was. Both need line-by-line detail. The best-known library, `robots-parser` (npm, version 3.0.1, last published 21 Feb 2023, checked 19 Nov 2026), only answers yes or no questions such as `isAllowed(url, ua)`. It does not expose the lines or groups, so we would still need our own parser on top. The matching rules in RFC 9309 fit in about 60 lines of code and are easy to cover with tests.

Rejected: `robots-parser` (no line-level output, no release in over 3 years). Google's open-source C++ parser (would need a native build or WebAssembly, far too heavy for this).

### D4. Guard the server fetch with Node's `https` module and `request-filtering-agent`

What: the server fetch uses Node's built-in `node:https` request with the `request-filtering-agent` package plugged in. The package refuses to connect to private or reserved IP addresses. Our own code adds checks before the request starts (listed in step 5). It also follows redirects by hand (at most 5) and caps both size and time.

Why this matters: the tester fetches any address a stranger types in. That opens the door to SSRF (server-side request forgery). SSRF means tricking the server into fetching an address it should never reach, such as another service on Railway's private network or a cloud metadata address. The defence is to look up the IP address behind the domain and refuse private ones. A DNS lookup turns a domain name into an IP address. The check has to happen at the moment the connection opens. Otherwise an attacker can use a domain that gives a safe address when checked and a private one a second later (DNS rebinding).

Why a library: the hard part is the list of address ranges to refuse. There are many (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x, 100.64.x, IPv6 private and link-local ranges, IPv4 addresses written in IPv6 form). Missing one is the usual way these guards fail. `request-filtering-agent` gets that list from `ipaddr.js`, a widely used package that Express also depends on. It checks the looked-up address at connect time, which covers DNS rebinding.

Why `node:https` and not `fetch`: the package README says Node's built-in `fetch` does not accept this kind of agent. Node's `https.request` does.

Rejected: writing the range list by hand with Node's built-in `net.BlockList`. That needs no package, but you would own the list and any gaps in it. It is the fallback if Viktor rejects the package. Also rejected: built-in `fetch` with a check before the request (open to DNS rebinding).

### D5. The HTTP status check per bot is a second, separate step

What: a second button, "Check what each bot gets", calls a second route, `/api/tools/robots-txt-tester/status`. That route requests the page once per bot, sending that bot's user agent. A user agent is the name a program sends with each request to say what it is. The route also sends one request with a normal browser user agent for comparison. It reports the HTTP status code each one got: 200 means the page came back, 403 means something refused it.

Why separate: a robots.txt check is one outside request. The status check is about 11. Making it a separate button keeps the main check fast and cheap. It also means most visitors only trigger one outside request. It ties the tester to post K08-B7 and gives it something most rival tools lack.

Why the browser comparison: if the browser request also gets 403, the site blocks this server. In that case the bot results mean nothing. Without it, readers will blame their robots.txt for a firewall problem.

Rules for this route:
- The server picks the user agent strings from `app/tools/_robots/logic/bots.ts`. The browser sends only the page URL. A visitor can never set request headers.
- Bots with no crawler of their own (Google-Extended, Applebot-Extended) are skipped. They are tokens in robots.txt that a normal crawler reads. The page explains this.
- The page must show the caveat from K08-B7: these requests come from this site's server and only pretend to be the bot. Cloudflare and others check real bots by IP address, so the real bot can get a different answer.

Rejected: running the status check every time with the main check (11 times the outside traffic for a feature many readers will not need). Also rejected: letting the browser send the user agent (lets anyone use the server to send any header to any site).

### D6. The generator merges into the existing file and builds its own diff

What: `app/tools/_robots/logic/merge.ts` takes the reader's existing file and their choices. It changes only the lines for the bots the reader changed. Every other line stays as it was. The merge tags each line with its change, and the UI shows that as a diff. A diff is a view of what changed, with removed lines in red and added lines in green.

Why merge matters, with an example: suppose a file has `User-agent: GPTBot` then `Allow: /`. A naive generator adds a second group, `User-agent: GPTBot` then `Disallow: /`, at the end. RFC 9309 says groups for the same bot combine. The combined rules are `Allow: /` and `Disallow: /`, which are the same length, and on a tie Allow wins. So GPTBot stays allowed and the reader thinks it is blocked. Phil's "merge, never replace" rule is right, and this is why it is worth the hours.

Why no diff library: the merge already knows which lines it added and removed, so the diff falls out of the merge for free. A diff library (such as `diff`, about 20 KB of browser code) would compare two texts after the fact to work out something we already know.

Rejected: generating a block for the reader to paste (the trap above). Rejected: replacing the whole file (deletes Sitemap lines and rules for other bots).

### D7. Pass files between the tools with sessionStorage

What: when the reader clicks "Fix this" in the tester, or "Check this file" in the generator, the current file text goes into `sessionStorage` under one key. Then the browser moves to the other page, which reads the key and deletes it. `sessionStorage` is storage in the browser that lasts while the tab is open and is never sent to the server.

Why: the reader never has to paste anything. The file stays in the browser and survives a page reload.

Rejected: putting the file in the URL query string. The query string ends up in Railway's logs. It also has a length limit. Rejected: a URL hash (the part after `#`). It works, but makes long ugly URLs for a sharing feature nobody asked for. Rejected: React context in `app/tools/layout.tsx`. It survives moving between pages but is lost on reload.

### D8. Unit tests with Vitest, for the logic files only

What: add Vitest as a dev dependency. Test every function in `app/tools/_robots/logic/` and `lib/net/safe-fetch.ts` that makes no network call. A unit test is a small piece of code that calls one function with known input and checks the output. No browser tests or UI tests in this plan.

Why: the parser and the merge are where a silent bug would give a reader a wrong answer about their own site. Tests catch that, and they let you change the code later without fear. The UI is easier to check by hand.

Rejected: Node's built-in test runner (`node --test`). It needs no package, but it does not understand this project's `@/` import paths, and running TypeScript through it needs extra config. Rejected: Jest (slower and more setup with TypeScript and ES modules).

### D9. Form controls from shadcn

What: run the shadcn CLI to add `input`, `textarea` and `checkbox` to `components/ui/`. Only `button` exists now.

Why: they match the existing button and theme. shadcn copies the source into the repo, and these build on `@base-ui/react`, which is already installed. No new runtime package.

### D10. Launch the tester first, then the generator

What: the tester launches complete, HTTP status check included (steps 1 to 10). The generator and the "Fix this" link follow (steps 11 to 14).

Why: D-017 needs one tool at launch, and the tester is that tool. The generator depends on the parser anyway, so it gets cheaper once the tester is done. Building both before launch pushes launch back by about 2 weeks for a tool the launch posts barely mention.

The D-017 fallback (generator first, live in about 2 weeks) only fits in 6 hours if the generator outputs a block to paste with no merge. Decision D6 shows why that gives wrong answers. If Phil wants the fallback, the honest cost is steps 1, 2, 3, 11 and 12, about 13 hours. My advice is to skip the fallback. See Q1.

### D11. Keep the robots tools code together in `app/tools/_robots/`, with one generic piece in `lib/`

What: everything that belongs to the two robots tools sits in one folder, `app/tools/_robots/`. It has two subfolders: `logic/` for plain TypeScript with no React in it, and `ui/` for the React components. Code that any tool or route could use stays in the top-level `lib/` folder. For this plan that means three files:
- `lib/net/safe-fetch.ts` (new): the guarded request that any tool can use (contents listed in step 5). The S00-1 architecture spec (S-001) already named this file.
- `lib/rate-limit.ts` (exists): the rate limiter the subscribe route already uses.
- `lib/read-capped.ts` (new): the body-size guard, moved out of the subscribe route.

Why the tool folder: Phil wants each tool's code in one place. That makes the tool easier to find and to delete. It also fits the D-017 upgrade path, where a heavy tool moves to its own Railway service. Next.js supports this: folders starting with `_` are left out of routing (`node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`, "Private folders"). CLAUDE.md's "isolated pages" rule is about URLs and layout. It neither asks for this nor rules it out, but it points the same way.

Why the safe fetch goes in `lib/`: it is the only piece in this plan with no robots knowledge in it. Any later tool that fetches a reader's URL (a meta tag checker, a schema checker) needs the same guard. One copy means one place for Viktor to audit and one place to fix. `logic/fetch.ts` keeps the robots parts: building the robots.txt address and the loop over bots.

Keeping server code out of the browser: the folder a file sits in does not decide what reaches the browser. Imports do. A client component pulls in only the files it imports, and their imports. So:
- `logic/fetch.ts` and `lib/net/safe-fetch.ts` both start with `import "server-only"`. If a client file ever imports either one, the build fails with a clear error.
- Only the two API routes import `logic/fetch.ts`. Nothing in `ui/` does.
- `logic/bots.ts`, `parse.ts`, `match.ts` and `merge.ts` must never import `fetch.ts`, because the browser uses them.

Imports: the API routes sit in `app/api/` and import with the `@/` path alias, for example `@/app/tools/_robots/logic/fetch`. The alias in `tsconfig.json` maps `@/` to the repo root, so this works with no change. Files inside `logic/` import each other with relative paths (`./parse`).

Tests: Vitest finds `*.test.ts` files anywhere in the repo by default. Set `include: ["app/**/*.test.ts", "lib/**/*.test.ts"]` in `vitest.config.ts` anyway, so it is clear where tests live. Next.js does not route test files, and inside a `_` folder there is no doubt.

What does not move:
- The API routes stay at `app/api/tools/robots-txt-tester/` (D-003). Moving them under `app/tools/robots-txt-tester/api/` would work. But it would break the one rule every tool follows for server work, and gain nothing.
- `lib/tools.ts`, `lib/tool-metadata.ts` and `lib/analytics.ts` stay. They serve every tool, and the sitemap and header read them.
- The bot list stays in the tool folder. The later rules pack email and monthly bot-list email can import it from there. If a blog post component or a third tool needs it, move it to `lib/` then.

Not now: a shared `app/tools/_shared/` folder for UI used by several tools. With one tool family there is nothing to share yet. Make it when a second tool needs something from `_robots/ui/`. Move that one part, and leave the rest.

Rejected: everything in `app/tools/_robots/logic/` (the first draft of this plan). It works, but it spreads one tool across two top-level folders. Also rejected: the safe fetch inside `_robots/` (the next tool that fetches a URL would import from another tool's folder, or copy the guard).

### Libraries and tools

| Name | Used for | Why add it | Cost and limits | Size and upkeep |
|------|----------|------------|-----------------|-----------------|
| `vitest` 5.1.1 (dev dependency) | Unit tests for the logic files | Runs TypeScript tests with no build step and supports the `@/` paths via Vite's `resolve.tsconfigPaths` option. Next.js has an official guide for it in `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`. | Free, MIT licence. Needs Vite 6, 7 or 8 as a peer, which pnpm installs. Needs Node 22.12+, 24 or 26+ (npm registry, checked 19 Nov 2026). | Dev only, so nothing reaches the browser or the server build. Very active project. You only need the `vitest` package. The guide's React, jsdom and testing-library packages are for UI tests, which this plan does not include. |
| `request-filtering-agent` 3.2.1 | Refuses connections to private and reserved IP addresses in the server fetch | The range list is the part SSRF guards get wrong. This package uses `ipaddr.js` for the list and checks at connect time. | Free, MIT licence. One dependency (`ipaddr.js`). Node 20+. Last release 29 Jun 2026 (npm registry, checked 19 Nov 2026). | Server only, nothing reaches the browser. Small. Viktor should read its source during the audit (step 10). |
| shadcn `input`, `textarea`, `checkbox` | Form controls | Match the existing button and theme. | Free. Source copied into `components/ui/`. | Uses `@base-ui/react`, already installed. |
| Railway outbound traffic | The server fetches | Already the host. | Egress is $0.05 per GB (docs.railway.com/reference/pricing/plans, checked 19 Nov 2026). 1,000 status checks at about 12 requests of up to 50 KB each is about 0.6 GB, or $0.03. | None. |

No library needed for:
- parsing robots.txt (D3)
- the diff (D6)
- passing files between pages (D7)

### Risks

- R1. The per-IP rate limit may group strangers together. D-005 planned no Cloudflare, but D-014 put Cloudflare in front of Railway. Railway's `X-Real-IP` header may now hold a Cloudflare address, so many visitors would share one rate-limit bucket. Security audit item F2 is still open. Recommendation: run the F2 tests before the tester launches, and ask Viktor which header to trust behind Cloudflare.
- R2. Sites block this server. Cloudflare and some hosts refuse requests from data-centre IPs. The tester must spot this and point to paste mode. Cloudflare marks its challenge pages with the header `cf-mitigated: challenge` (Cloudflare docs, "Detect a Challenge Page response", checked 19 Nov 2026). A plain 403 with `server: cloudflare` gets the same message.
- R3. The tester gives a wrong answer. Readers act on what the tester says about their own site. Mitigation: unit tests built from the RFC 9309 rules, and step 10 checks this site against known results.
- R4. The bot list goes stale. Vendors rename and add bots. Each entry carries the date it was checked and a link to the vendor page, and the page shows "bot list checked on <date>". A monthly check fits the planned bot-list update email.
- R5. Railway's IP gets flagged. Sending requests as Googlebot from Railway is normal for SEO tools, but a site's firewall may log it. The page copy says the requests are tests from this site.
- R6. The page copy is out of date. `lib/copy.ts` says tools "run in your browser". The tester fetches on the server, so that line needs a change (Margot).

## Interface contracts

These are the agreed shapes between files. Build to them, so the UI and the logic can be written in any order without rework.

### File layout

```
app/tools/
  _robots/                          robots tools code, never a URL
    logic/
      bots.ts                       bot list, used by both tools and both routes
      parse.ts                      parseRobots(text)
      match.ts                      checkPath(...), checkFetched(...)
      merge.ts                      readChoices(...), mergeAiRules(...)
      fetch.ts                      server-only: fetchRobots(url), fetchStatuses(url)
      *.test.ts                     Vitest tests next to each file
    ui/
      tester-tool.tsx               main client component for the tester
      generator-tool.tsx            main client component for the generator
      file-input.tsx, bot-table.tsx, diff-view.tsx
      handoff.ts                    sessionStorage helper
  robots-txt-tester/page.tsx
  ai-crawler-robots-txt-generator/page.tsx
app/api/tools/robots-txt-tester/
  route.ts                          POST, fetch robots.txt
  status/route.ts                   POST, HTTP status per bot
lib/
  net/safe-fetch.ts                 server-only, generic SSRF-safe request (new)
  net/safe-fetch.test.ts
  read-capped.ts                    body-size guard, moved from the subscribe route (new)
  rate-limit.ts                     exists
  tools.ts                          two new entries
```

Files inside `logic/` import each other with relative paths (`./parse`). Files outside the folder import with the alias, for example `@/app/tools/_robots/logic/fetch`. Only server files may import `logic/fetch.ts` (D11).

### Bot list (`app/tools/_robots/logic/bots.ts`)

```ts
export type BotGroup = "search-engine" | "ai-search" | "ai-training" | "ai-user-fetch";

export type Bot = {
  token: string;            // name used after "User-agent:", e.g. "GPTBot"
  vendor: string;           // "OpenAI"
  group: BotGroup;
  purpose: string;          // one plain sentence shown in the results table
  userAgent: string | null; // full header the crawler sends; null when it has no crawler of its own
  docsUrl: string;          // vendor's own page
  checkedOn: string;        // "2026-11-19"
  note?: string;            // trade-offs, e.g. Google-Extended and Gemini grounding
};

export const BOTS: Bot[];
export const BOT_LIST_CHECKED_ON: string; // latest checkedOn, shown on both pages
```

The tester shows every group. The generator shows the three AI groups only.

Starting list, from `app/robots.ts` and D-015:

| Token | Group | Has its own crawler |
|-------|-------|---------------------|
| Googlebot, Bingbot | search-engine | yes |
| OAI-SearchBot, PerplexityBot, Claude-SearchBot | ai-search | yes |
| GPTBot, ClaudeBot, CCBot | ai-training | yes |
| Google-Extended, Applebot-Extended | ai-training | no (read by Googlebot and Applebot) |
| ChatGPT-User, Claude-User | ai-user-fetch | yes |

ChatGPT-User needs a note. OpenAI's bots page says "Because these actions are initiated by a user, robots.txt rules may not apply" (developers.openai.com/api/docs/bots, checked 19 Nov 2026). The generator must tell readers that blocking it may have no effect.

Candidates to add (see Q5): Applebot, Perplexity-User, Amazonbot, meta-externalagent, Bytespider.

### Parser output (`app/tools/_robots/logic/parse.ts`)

```ts
export type LineKind =
  | "user-agent" | "allow" | "disallow" | "sitemap"
  | "other-directive"  // e.g. Crawl-delay, Host
  | "comment" | "blank" | "invalid";

export type Line  = { n: number; raw: string; kind: LineKind; value: string }; // n starts at 1
export type Rule  = { type: "allow" | "disallow"; path: string; line: number };
export type Group = { agents: string[]; rules: Rule[]; firstLine: number; lastLine: number };
export type Issue = { line: number | null; level: "error" | "warning" | "info"; code: IssueCode; message: string };

export type Parsed = { lines: Line[]; groups: Group[]; sitemaps: string[]; issues: Issue[]; eol: "\n" | "\r\n" };

export function parseRobots(text: string): Parsed;
```

Issue codes for the first version. More can come later.

| Code | Level | When |
|------|-------|------|
| `served-html` | error | The text starts with `<!doctype` or `<html`. Usually the site's 404 page sent back with status 200. |
| `missing-colon` | error | A line that is not blank or a comment and has no `:` |
| `rule-before-user-agent` | error | Allow or Disallow before any User-agent line. Crawlers ignore it. |
| `unknown-directive` | warning | For example `Dissallow`. Suggest the closest known word when the spelling is close. |
| `path-not-slash` | warning | An Allow or Disallow path that starts with something other than `/` or `*` |
| `blocks-everything` | warning | The `*` group has `Disallow: /` |
| `noindex-in-robots` | warning | A `Noindex:` line. Google stopped supporting it in 2019. |
| `sitemap-not-absolute` | warning | A Sitemap value that does not start with `http://` or `https://` |
| `too-large` | warning | The file is over 500 KiB. Google ignores the rest. |
| `bot-in-several-groups` | info | The same bot appears in more than one group. The rules combine. |
| `crawl-delay-google` | info | A `Crawl-delay` line. Google ignores it. |
| `empty-disallow` | info | `Disallow:` with no path. It allows everything. Explain this, since many people read it the other way. |

Parsing rules, from RFC 9309:
- A group is one or more User-agent lines in a row, then rules. It ends at the next User-agent line that follows a rule, or at the end of the file. Blank lines do not end a group.
- Directive names and user agent tokens are not case sensitive. Paths are case sensitive.
- Strip `#` comments and a leading byte order mark (an invisible character some editors put at the start of a file). Accept both `\n` and `\r\n` line endings, and record which one the file uses so the merge can keep it.

### Rule checker (`app/tools/_robots/logic/match.ts`)

```ts
export type CheckResult = {
  allowed: boolean;
  rule: Rule | null;                     // the rule that decided it; null if none matched
  usedGroup: "own" | "star" | "none";    // bot's own group, the * group, or no group
};

export function checkPath(parsed: Parsed, token: string, path: string): CheckResult;

// Applies the status-code rules before looking at the text.
export function checkFetched(status: number, parsed: Parsed | null, token: string, path: string): CheckResult;
```

Rules to follow (RFC 9309):
- Pick every group whose agents include the token (not case sensitive) and combine their rules. If none, use the `*` group. If there is no `*` group, everything is allowed.
- The longest matching rule wins, measured in characters of the rule path. If an Allow and a Disallow are the same length, Allow wins.
- `*` matches any run of characters. `$` at the end means the path must end there.
- The path includes the query string (`/page?x=1`).
- `/robots.txt` itself is always allowed.
- `checkFetched`: status 400 to 499 means everything is allowed. Status 500 to 599, or no answer, means everything is blocked. Only 200 to 299 uses the file text.

### Merge (`app/tools/_robots/logic/merge.ts`)

```ts
export type Choice = "block" | "allow";
export type Current = Choice | "custom"; // "custom" = bot has its own group with partial rules

export function readChoices(parsed: Parsed, tokens: string[]): Record<string, Current>;

export type DiffLine = { text: string; change: "same" | "added" | "removed" };

export function mergeAiRules(
  original: string,
  changes: Record<string, Choice>, // only the bots the reader changed
  date: string,                    // "2026-11-19", goes in the comment line
): { text: string; diff: DiffLine[]; warnings: string[] };
```

Merge rules:
1. Bots missing from `changes` are not touched, and that includes "custom" bots.
2. For each changed bot, remove its `User-agent:` line from every group. If that leaves a group with no agents, remove that group's rule lines too. Leave comments in place.
3. Add one block at the end of the file. It starts with a comment line (see Q6), then one group for all blocked bots (`User-agent:` lines, then `Disallow: /`).
4. "Allow" adds nothing, because the bot now falls back to the `*` group. One exception: if the `*` group blocks `/`, add a group with `Allow: /` for those bots and a warning. The warning says this also opens any pages the `*` group blocks.
5. Keep the file's line endings. Keep every line not touched by rules 2 to 4 exactly as it was.
6. Running the merge again on its own output with the same choices changes nothing.

### Route: fetch robots.txt

`POST /api/tools/robots-txt-tester`

- Request JSON: `{ url: string }`. Body at most 2 KB, `url` at most 2,048 characters. Reuse `readCapped` from `app/api/subscribe/route.ts` by moving it to `lib/read-capped.ts`.
- 200: `{ ok: true, robotsUrl: string, finalUrl: string, redirects: string[], status: number, contentType: string | null, text: string, truncated: boolean, challenged: boolean }`
  - `status` is the status the target site returned. A 404 is still a 200 from our route, because "no robots.txt" is a result.
  - `text` is empty unless `status` is 200 to 299.
  - `challenged` is true when the response has `cf-mitigated: challenge`, or is a 403 with `server: cloudflare`.
  - `truncated` is true when the file was cut at 500 KiB.
- 400: `{ ok: false, error: "invalid_url" | "address_not_allowed" }`
- 429: `{ ok: false, error: "rate_limited" }` with a `Retry-After` header
- 502: `{ ok: false, error: "timeout" | "unreachable" | "too_many_redirects" }`
- 503: `{ ok: false, error: "busy" }` when 4 outside requests are already running
- Every response sends `Cache-Control: no-store`.
- Limits: 10 per IP per minute and 60 per minute in total, using `rateLimit()` from `lib/rate-limit.ts`. Time limit 8 seconds for the whole fetch, including redirects.
- Sends the user agent `TheAIBusinessKit-RobotsTester/1.0 (+<SITE_URL>/tools/robots-txt-tester)`. An honest name lets site owners see who fetched.

### Route: HTTP status per bot

`POST /api/tools/robots-txt-tester/status`

- Request JSON: `{ url: string }`, same limits as above.
- 200: `{ ok: true, url: string, results: { token: string; status: number | null; challenged: boolean; error?: "timeout" | "unreachable" }[] }`. The first result has `token: "browser"` and is the comparison request.
- Same 400, 429 and 503 errors as above.
- Limits: 3 per IP per minute and 15 per minute in total. 5 seconds per request, 20 seconds for the whole check. Shares the limit of 4 outside requests at once with the other route.
- Uses GET, because that is what bots send.
- Does not follow redirects. It reports the 3xx code as it is.
- Stops reading once the headers arrive.

### Hand-off between the tools (`app/tools/_robots/ui/handoff.ts`)

```ts
// sessionStorage key "robots-handoff"
type Handoff = { text: string; from: "tester" | "generator"; siteUrl: string | null; savedAt: number };
export function saveHandoff(h: Omit<Handoff, "savedAt">): void;
export function takeHandoff(): Handoff | null; // reads, then deletes; ignores entries older than 30 minutes
```

### Analytics

- Tester: `track("tool_run", { tool: "robots-txt-tester" })` once a result shows (fetched or pasted).
- Generator: `track("tool_run", { tool: "ai-crawler-robots-txt-generator" })` when the reader copies or downloads the output.
- Never send the URL or the file text. The event type in `lib/analytics.ts` already allows `{ tool: string }`, so nothing changes there.

### Pages and registry

- Two entries in `lib/tools.ts` with `published: false` until launch. That keeps them `noindex` and out of the sitemap through the existing `toolMetadata()`.
- `components/tool-shell-heading.tsx` already prints each tool's H1 and short description from the registry. Each `page.tsx` adds its own intro and explanation below the tool.
- No `proxy.ts` change. These are fixed folders, so an unknown `/tools/<name>` already returns a real 404.

## Tasks

### Overview

| # | Task | Owner | Depends on | Hours | Running total |
|---|------|-------|------------|-------|---------------|
| 1 | Prepare the branch and install the tools | phil | - | 0.5 | 0.5 |
| 2 | Bot list | phil | 1 | 1.5 | 2 |
| 3 | Parser and tests | phil | 1 | 3 | 5 |
| 4 | Rule checker and tests | phil | 3 | 2 | 7 |
| 5 | Safe server fetch and tests (security review required) | phil | 1 | 3 | 10 |
| 6 | Route: fetch robots.txt (security review required) | phil | 5 | 1.5 | 11.5 |
| 7 | Tester UI with fetch and paste | phil | 2, 4, 6 | 4 | 15.5 |
| 8 | Tester page and registry entry | phil | 7 | 1 | 16.5 |
| 9 | HTTP status per bot (security review required) | phil | 6, 7 | 2.5 | 19 |
| 10 | Security audit and launch checks | phil, viktor | 8, 9 | 1.5 | 20.5 |
| 11 | Merge and tests | phil | 3, 4 | 4 | 24.5 |
| 12 | Generator UI and page | phil | 2, 11 | 4 | 28.5 |
| 13 | Hand-off between the tools | phil | 8, 12 | 1.5 | 30 |
| 14 | Publish the generator and link both ways | phil | 13 | 0.5 | 30.5 |

At 6 hours a week: tester done in about 3.5 weeks of tool time. Add the 6.5 hours of launch posts and the tester launch lands at about week 4 to 5 from now. If time runs short, step 9 can move to just after launch. That saves 2.5 hours and loses nothing else.

### Step 1. Prepare the branch and install the tools

What to build:
- A new branch off `feat/s00-1-content-first`, for example `feat/robots-tools`.
- `pnpm add -D vitest`, a `vitest.config.ts` with `resolve.tsconfigPaths: true` and `include: ["app/**/*.test.ts", "lib/**/*.test.ts"]`, and a `"test": "vitest"` script in `package.json`.
- `pnpm dlx shadcn@latest add input textarea checkbox`.
- Make `app/tools/_robots/logic/` and `app/tools/_robots/ui/`, with one test in `logic/` that checks `1 + 1 === 2`.

Why: tests come first so steps 3, 4, 5 and 11 can be written test-first. That suits the parser well, since the RFC gives you the expected answers before you write any code.

Done when: `pnpm test` runs and passes the dummy test. `pnpm build` still passes. The three new files exist in `components/ui/`.

Time: 0.5 hours.

### Step 2. Build the bot list

What to build: `app/tools/_robots/logic/bots.ts` to the shape in "Interface contracts". Fill it from the starting list. For each bot, open the vendor's page and copy the token and the full user agent string. Write down the date you checked. Write `purpose` and `note` in plain words, and keep them within the writing rules.

Why: both tools and both routes read this one file, so a bot change happens in one place. The `checkedOn` dates let the page say when the list was last checked, which builds trust and supports the monthly email. Keep `app/robots.ts` as it is for now. Making it read from this file is a later tidy-up that is easy to get wrong for little gain (see "Out of scope").

Done when: every bot has a working `docsUrl` and a `checkedOn` date. Every bot with its own crawler has a `userAgent` copied from the vendor page. Google-Extended and Applebot-Extended have `userAgent: null` and a note saying why. A test checks there are no duplicate tokens and every token matches RFC 9309's allowed characters (letters, `-` and `_`).

Time: 1.5 hours. Most of it is reading vendor pages.

### Step 3. Build the parser

What to build: `parseRobots()` in `app/tools/_robots/logic/parse.ts` and `parse.test.ts`, to the contract above. The parser goes through the file line by line. For each line it works out the kind, then builds the groups, then runs the issue checks.

Why: the parser is the base for everything else. It keeps every line with its number, so the tester can say "line 14" and the merge can keep lines as they were. Write the tests first from the parsing rules in the contract.

Done when these tests pass:
- A group with two User-agent lines then `Disallow: /` gives one group with two agents.
- A blank line between `User-agent: GPTBot` and `Disallow: /` still gives one group.
- `user-agent: gptbot` and `USER-AGENT: GPTBot` both parse as the agent `gptbot`.
- A file with `\r\n` endings and a byte order mark parses the same as a plain one, and `eol` is `"\r\n"`.
- Each issue code in the table fires on a small example file and does not fire on this site's own robots.txt.
- An HTML page gives a `served-html` error.

Time: 3 hours.

### Step 4. Build the rule checker

What to build: `checkPath()` and `checkFetched()` in `app/tools/_robots/logic/match.ts` and `match.test.ts`.

Why: this answers the question the tester exists for. Keeping it apart from the parser means the generator can call it on its own, to work out each bot's current setting.

Done when these tests pass:
- `Disallow: /` blocks `/anything`. `Disallow:` with no path allows everything.
- `Allow: /p` and `Disallow: /` gives `/page` allowed (longer match wins).
- `Allow: /page` and `Disallow: /page` gives allowed (tie goes to Allow).
- `Disallow: /*.pdf$` blocks `/a.pdf` and allows `/a.pdf?x=1`.
- `Disallow: /Admin` allows `/admin` (paths are case sensitive).
- A bot with its own group ignores the `*` group entirely, and `usedGroup` is `"own"`.
- Two groups naming GPTBot combine their rules.
- `/robots.txt` is allowed even under `Disallow: /`.
- `checkFetched(404, ...)` allows. `checkFetched(503, ...)` blocks.
- This site's live file gives: GPTBot, ClaudeBot, CCBot, Google-Extended and Applebot-Extended blocked on `/`. Googlebot, Bingbot, OAI-SearchBot and PerplexityBot allowed. ChatGPT-User allowed through the `*` group.

Time: 2 hours.

### Step 5. Build the safe server fetch

What to build: two files, both starting with `import "server-only"`. That import makes the build fail if browser code ever imports the file. Install `request-filtering-agent`.

First, `lib/net/safe-fetch.ts`, the generic part (D11). It knows nothing about robots.txt. It holds:
  - the URL checks below
  - a request helper that uses `https.request` (or `http.request`) with the filtering agent
  - redirect handling, plus the size and time caps
  - the counter of requests in flight

Tests go in `lib/net/safe-fetch.test.ts`.

Then `app/tools/_robots/logic/fetch.ts`, the robots part, built on the helper. Write two functions:
- `fetchRobots(input)`. It builds `<origin>/robots.txt` and requests it through the helper. The helper follows up to 5 redirects by hand and checks each new URL the same way. It stops reading at 500 KiB and stops the whole thing at 8 seconds. `fetchRobots` returns the shape the route sends.
- `fetchStatuses(input)`, used in step 9. The helper already does the hard work, so step 9 only adds the loop.

URL checks in `lib/net/safe-fetch.ts`, before any request:
- Add `https://` if the reader typed a bare domain.
- Allow `http:` and `https:` only, ports 80 and 443 only.
- Refuse URLs with a username or password.
- Refuse `localhost`, any name ending in `.internal` or `.local`, and raw IP addresses. Real sites have names.

Also add a module-level counter in `safe-fetch.ts` for outside requests in flight. When 4 are running, return "busy". It lives there so every tool that fetches shares the same cap.

Why: this is the one part of the build where a mistake hurts more than this site. Decision D4 explains the library choice. The checks before the request give the reader a clear error message. The agent is the real guard, because it checks the address at the moment of connecting. Refusing raw IP addresses removes a whole class of tricks (such as `http://2130706433/`, which is 127.0.0.1 written as one number). Redirects are followed by hand so each hop gets checked.

Done when these tests pass (no network needed), split between the two test files:
- `localhost`, `127.0.0.1`, `[::1]`, `10.0.0.1`, `169.254.169.254`, `http://2130706433/`, `foo.railway.internal`, `https://user:pass@example.com` and `https://example.com:8080` are all refused before any request.
- `example.com` becomes `https://example.com/robots.txt`.
- `https://example.com/blog/post?x=1` gives the robots URL `https://example.com/robots.txt` and the path `/blog/post?x=1`.

And this manual check, run once with `pnpm dev`: point it at a test domain that resolves to 127.0.0.1 (ask Viktor for one, or use a public wildcard DNS service such as `127.0.0.1.nip.io`). The agent must refuse it.

Time: 3 hours.

### Step 6. Build the route that fetches robots.txt

What to build: `app/api/tools/robots-txt-tester/route.ts`. It follows the same pattern as `app/api/subscribe/route.ts`: rate limit, read the body with a size cap, check it, call `fetchRobots`, shape the reply. Move `readCapped` from the subscribe route into `lib/read-capped.ts` so both routes share it.

Why: copying the subscribe route's pattern keeps the two routes alike, so Viktor reviews one pattern. Moving `readCapped` stops a second copy of the body-size guard from drifting away from the first.

Done when:
- `curl -X POST localhost:3000/api/tools/robots-txt-tester -H 'Content-Type: application/json' -d '{"url":"theaibusinesskit.com"}'` returns `ok: true`, status 200 and the file text.
- The same with `{"url":"localhost"}` returns 400 `address_not_allowed`.
- The 11th request inside a minute from one IP returns 429 with `Retry-After`.
- A body over 2 KB returns 400.
- The subscribe route still works after the `readCapped` move.

Time: 1.5 hours.

### Step 7. Build the tester UI

What to build: `app/tools/_robots/ui/tester-tool.tsx` (client component) and the shared parts it uses.

- One URL box and a "Check" button. Under it, a small link: "Or paste a file". That shows a textarea and a path box.
- When a result comes back, show these in order:
  - a summary of the fetch (robots.txt address, status code, redirects)
  - one row per bot, grouped by bot group, saying allowed or blocked and naming the line that decided it
  - the issues list with line numbers
  - the file itself with line numbers
- When the status is 4xx: say there is no robots.txt, so every bot may crawl. When it is 5xx or unreachable: say crawlers treat this as "block everything" and that it needs fixing first.
- When `challenged` is true, or the route returns an error: say the site blocked this check and offer paste mode.
- Wrap the page-specific text that explains each result in plain sentences. The `purpose` and `note` fields from the bot list do most of this work.

Why: the brief says the tester wins on AI-bot checks and clear explanations per result, so the results table and its wording matter more than the styling. Paste mode comes free, because the browser does the parsing (D1). It helps when a site blocks this server. It also lets people test a file before they upload it.

Done when:
- Checking `theaibusinesskit.com` shows the results listed in step 4.
- Pasting the same file with path `/` shows the same results with no network request (check the Network tab in DevTools).
- Pasting a file with a typo (`Dissallow: /`) shows the `unknown-directive` warning on the right line.
- The page works with the keyboard alone. Each result row says allowed or blocked in words as well as colour.
- Phone width (375 px) has no sideways scrolling.

Time: 4 hours.

### Step 8. Add the tester page and its registry entry

What to build:
- `app/tools/robots-txt-tester/page.tsx` with `export const metadata = toolMetadata("robots-txt-tester")`. It renders `TesterTool` and then the explanation text. The text covers:
  - what robots.txt is, and that some bots ignore it
  - how the AI bot groups differ
  - when the bot list was last checked (`BOT_LIST_CHECKED_ON`)
- The `lib/tools.ts` entry with `published: false`.
- The `tool_run` call from the contract.
- Ask Margot to fix the "run in your browser" line in `lib/copy.ts` (risk R6) and to do a pass on the page text.

Why: the explanation text sits in the page, rendered on the server. That way search engines see it without running the tool, and it is what lets the page rank against bigger tools. The registry entry keeps the page `noindex` until launch.

Done when: the page source (View Source, before any JavaScript runs) contains the H1 and the explanation text. The page has `noindex` while `published` is false. The writing-rules grep in CLAUDE.md finds nothing on the page text. A test run shows a `tool_run` event in Umami (production build only).

Time: 1 hour, plus your writing time for the explanation text.

### Step 9. Build the HTTP status check per bot

What to build: `fetchStatuses()` in `app/tools/_robots/logic/fetch.ts`, the route `app/api/tools/robots-txt-tester/status/route.ts`, and a "Check what each bot gets" button with a results section in the tester UI. Follow decision D5 and the route contract.

Why: see D5. The caveat text is part of the feature. Without it the results mislead readers in exactly the way post K08-B7 warns about.

Done when:
- Checking `https://theaibusinesskit.com/` gives the browser 200 and the search bots 200. GPTBot, ClaudeBot and CCBot most likely get 403 from the Cloudflare edge (D-015). If they get 200, that is the R2 effect and the caveat text explains it.
- Google-Extended and Applebot-Extended show "no crawler of its own" in place of a status.
- The caveat text shows above the results every time.
- The 4th check inside a minute from one IP returns 429.
- The request body cannot change the user agent sent (test: add a `"userAgent"` field and confirm it is ignored).

Time: 2.5 hours.

### Step 10. Run the security audit and launch checks

What to build: nothing new. Hand Viktor the two routes, `lib/net/safe-fetch.ts` and `app/tools/_robots/logic/fetch.ts` for the SSRF pass he asked for in the S00-1 audit. Fix what he finds. Then:
- Run the F2 rate-limit tests (risk R1).
- Make sure Yuki's CSP work (F6) allows the page's calls to its own API. `connect-src 'self'` covers it.
- Run Lighthouse on the tester page.
- Set `published: true`, deploy, and check the page is in the sitemap.

Why: the tester is the first page where a stranger's input makes this server send requests. Viktor asked to see it before it ships.

Done when: Viktor signs off. F2 has a result written in STATE.md. The live page passes the step 7 checks. `/sitemap.xml` lists the page. Search Console's URL Inspection can fetch it.

Time: 1.5 hours of your time, plus Viktor's.

### Step 11. Build the merge

What to build: `readChoices()` and `mergeAiRules()` in `app/tools/_robots/logic/merge.ts` and `merge.test.ts`, to the contract and merge rules above. Write the tests before the code.

Why: this is the step where a bug could hand a reader a file that does the opposite of what they asked (decision D6). It is the reason the generator costs 10 hours. Use `checkPath(parsed, token, "/")` from step 4 inside `readChoices`. If the bot has its own group with rules other than a site-wide allow or block, mark it "custom".

Done when these tests pass:
- An empty file, with GPTBot set to block, gives the comment line plus a group with `User-agent: GPTBot` and `Disallow: /`.
- `User-agent: GPTBot` then `Allow: /`, with GPTBot set to block, removes those two lines and adds the block group. `checkPath` on the result says blocked.
- A shared group (GPTBot and CCBot, `Disallow: /`) with only GPTBot set to allow removes the GPTBot line. CCBot stays blocked, and GPTBot falls back to `*`.
- `User-agent: *` then `Disallow: /`, with OAI-SearchBot set to allow, adds `Allow: /` for OAI-SearchBot and returns one warning.
- A bot with partial rules (`Disallow: /private`) that the reader did not change keeps its lines.
- Every line the merge had no reason to touch comes out the same, character for character.
- Merging the output again with the same choices gives the same text.
- A `\r\n` file comes out with `\r\n` endings.
- For every test, `checkPath` on the output agrees with the choices made. That one check catches most merge bugs.

Time: 4 hours.

### Step 12. Build the generator UI and page

What to build:
- `app/tools/_robots/ui/generator-tool.tsx`. It has a starting-file area (blank, or paste your current file) and checkboxes grouped by AI bot group, with each bot's `purpose`. Preset buttons: "Block training only", "Block all AI", "Allow all". The output appears as a diff view, with copy and download buttons.
- Platform notes under the output: if your site is behind Cloudflare, check its managed robots.txt setting (link to posts K08-B5 and K08-B6 once live).
- A line under the tool: "robots.txt is a request, and some bots ignore it." Plus the ChatGPT-User note.
- `app/tools/ai-crawler-robots-txt-generator/page.tsx` with its own explanation text. The main point is the difference between the AI bot groups. Blocking the wrong group removes a site from AI search. Add the `lib/tools.ts` entry with `published: false` and the `tool_run` call.
- Optional: a "Load from my site" box that calls the step 6 route. It adds no new risk, since the route already exists and has been audited.

Why: the presets cover what most readers want in one click, and the checkboxes cover the rest. Showing the diff answers the reader's real worry, "what will this do to my file?".

Done when: "Block training only" on this site's live file gives a diff with no changes (the file already does this). "Allow all" on the same file shows the training block lines removed and nothing else changed. The explanation text is in the page source. The page meets the step 7 keyboard and phone checks.

Time: 4 hours.

### Step 13. Build the hand-off between the tools

What to build: `app/tools/_robots/ui/handoff.ts` to the contract, and the buttons that use it:
- In the tester: a "Fix this" button. It saves the fetched or pasted file and opens the generator. The generator calls `takeHandoff()` on load, and if there is a file it uses it as the starting file. `readChoices` sets the ticks.
- In the generator: a "Check this file" button. It saves the merged output and opens the tester, which opens in paste mode with the file filled in.

Why: this is Phil's test-then-fix flow. sessionStorage keeps the file in the browser (D7).

Done when: tester, then "Fix this", then the generator shows the same file with the ticks matching the tester's results. Then "Check this file" brings the tester back in paste mode with the merged file, and the results match the ticks. A reload of the generator page after "Fix this" still shows the file. Opening the generator in a fresh tab starts blank.

Time: 1.5 hours.

### Step 14. Publish the generator and link both ways

What to build: set the generator's `published: true`. Add links from the tester page to the generator and back. Add tool links in the launch posts (K03-B5, K03-B4, K08-B5) as the briefs say.

Done when:
- both pages are in `/sitemap.xml` and link to each other
- the launch posts link to the tools

Time: 0.5 hours.

## Security notes

For Viktor:
- New attack surface: two POST routes that make this server request addresses chosen by a stranger. Main risk: SSRF into Railway's private network or cloud metadata addresses. Defences:
  - the URL checks in step 5 (ports 80 and 443 only, raw IP addresses refused)
  - `request-filtering-agent` checking the address at connect time
  - each redirect checked before it is followed
- Resource abuse:
  - rate limits per IP and in total
  - at most 4 outside requests at once
  - time limits on each fetch
  - a 500 KiB read cap and a 2 KB request body cap
- Header injection: the browser never sends user agent strings or any header values. The server takes them from `app/tools/_robots/logic/bots.ts`.
- Output: the fetched file is shown as text in React, so it is escaped. Never render it with `dangerouslySetInnerHTML`. An HTML 404 page served as robots.txt must show as text.
- Privacy: nothing stored and no URL sent to analytics. The URL travels in the POST body, so it stays out of query-string logs. Check whether Railway logs request bodies (it should not).
- Rate-limit keying depends on F2 (risk R1).

## Out of scope

- Making `app/robots.ts` read from `app/tools/_robots/logic/bots.ts`. It is a nice tidy-up, but this site's file is a deliberate list of choices (D-015) and should not change when the tool's list changes.
- The AI-bot rules pack email offer and the monthly bot-list email. They use `bots.ts` later.
- Saving results or sharing them by link.
- Checking more than one URL at a time, or crawling a site.
- Partial rules per bot in the generator (A2).
- UI tests in a real browser (Playwright). Unit tests cover the logic, and the UI gets checked by hand.
- FAQ structured data and llms.txt (CLAUDE.md).
- Rules for other bots, such as SEO tool crawlers or social media preview bots.

## Open questions

Decisions Phil needs to make. Each has my recommendation.

- Q1. Launch order. Option A: the tester launches alone (steps 1 to 10, about 20 hours), and the generator follows about 2 weeks later. Option B: both launch together (about 30 hours, launch about 2 weeks later than A). Option C: the D-017 fallback, generator first. A safe version (with the merge) is about 13 hours, so it saves little. **Recommendation: A.** If time is tight, move step 9 to just after launch.
- Q2. The 12-hour backlog estimate for the tester. This plan says about 20. The extra hours go mostly on tests and the fetch guard. The status check adds the rest. **Recommendation:** accept the higher figure and tell Priya, so the launch date in STATE.md is honest. If 20 hours is too many, hand step 5 (the safe fetch) to Tomás. It is the riskiest step, and you learn the least from it about the product.
- Q3. `request-filtering-agent` or a hand-written range list with `net.BlockList` (D4). **Recommendation: the package.** Ask Viktor to confirm during step 10.
- Q4. One shared main component (your note) or two main components with shared parts (D2). **Recommendation: two.** The flow between the tools works the same either way.
- Q5. Which extra bots go in the list. Candidates: Applebot, Perplexity-User, Amazonbot, meta-externalagent, Bytespider. **Recommendation:** add a bot only when its vendor has a page naming the token. Leave out any bot known to ignore robots.txt, or keep it with a note saying so, because a generator that offers to block it misleads the reader.
- Q6. The comment line the generator writes into readers' files. **Recommendation:** `# AI crawler rules, updated 2026-11-19 with https://theaibusinesskit.com/tools/ai-crawler-robots-txt-generator`. It helps the reader find the tool again when the bot list changes. The URL in a comment does not count as a link for search engines, so it is a help to the reader and nothing more.
- Q7. Which header to trust for rate limiting now that Cloudflare sits in front (R1). **Recommendation:** Viktor decides after the F2 tests, before step 10. Steps 1 to 9 do not wait on it.
