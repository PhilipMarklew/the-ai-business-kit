# STATE

## Since last session (2026-11-18, later)
- Domain theaibusinesskit.com live on Railway behind Cloudflare; apex canonical, www 301s to apex (D-014)
- Umami ID set in Railway and .env.local; tracker, opt-out and query stripping verified in a browser (no code changes)
- Phil excludes own visits with the /privacy opt-out button, per browser; no ?notrack link
- specs/umami-dashboard-setup.md: Phil completed the dashboard steps 2026-11-18
- Cloudflare SSL/TLS mode confirmed Full by Phil 2026-11-18
- D-015: robots.txt in app/robots.ts only; AI training crawlers blocked. Deployed 2026-11-18 (249d42d). Cloudflare Bot Preference Sync off, Training policy Block. Verified: live robots.txt is ours only; training bots 403, search and agent bots 200
- DECISIONS: added D-014. Handoff and .env.example updated for the domain
- Railway serves feat/s00-1-content-first (origin tip 431c8aa); main is not merged

## Current objective
S00-1 Site foundations, now scoped as a blog with tools (D-010). Week 1 of 12. Budget about 6 hrs of Phil's time.
Brief: docs/handoffs/S00-1-site-foundations.md (12 deliverables, acceptance checks in section 6).

## Sequence progress (handoff section 5)
1. Priya memory bootstrap. DONE
2. Marcus architecture note. DONE (docs/specs/S00-1-architecture.md)
2b. Margot name candidates. DONE; Phil chose "The AI Business Kit" (D-009)
3. Phil: D2 DONE (Kit Free); domain DONE 2026-11-18, live on Railway (D-014)
4. Noor visual direction: superseded by Phil's dark brand look (D-011)
5. Yuki build: DONE for scaffold, layout, blog (MDX, topics, share images, sitemap), restyle, 3 draft sample posts. Margot copy and privacy draft committed.
5b. Tomas /api/subscribe: DONE 2026-11-18 (Kit v4, committed). Phil's real test signup works; Kit API works on free plan. Rate-limit per-IP check skipped when X-Real-IP missing.
5d. Yuki analytics + Margot privacy copy: DONE 2026-11-18, committed.
6. Viktor audit DONE (specs/security-audit-S00-1.md). Eleanor, Quinn: NOT STARTED
7. Phil: Umami dashboard setup DONE 2026-11-18. Search Console DONE 2026-11-18 (verified, sitemap submitted, per Phil). Social accounts NOT STARTED
8. Priya: week-1 audience tracker row (item 11). NOT STARTED
5c. Yuki SEO hardening: DONE 2026-11-17, committed 2026-11-18. Margot meta copy applied (specs/seo-meta-copy.md).

## Decisions (see DECISIONS.md)
- D1 DECIDED (D-009). D3 hosting DECIDED (D-005). D-010 blog scope, D-011 design DECIDED.
- D2 DECIDED: Kit Free (D-006). D-013 analytics: Umami Cloud.
- D4 consent records: proposed provider only (D-008); Astrid to confirm.

## Blockers / flags
- Three draft sample posts in content/posts/ need Phil's approval or replacement before live.
- lib/social.ts: X (x.com/TheAIBizKit) and TikTok (@the.ai.business.ki, added 2026-11-18; auto-generated handle cut at the length limit, Phil plans to rename it, then update the URL here) set; YouTube URL null.
- Security audit open items: F2 live X-Real-IP spoof and shared-bucket tests (Phil + Quinn; unblocked, site is deployed); F3, F4, F5 (Tomas, deferred by Phil); F6 CSP (Yuki; unblocked, Umami ID is set: script-src cloud.umami.is, connect-src gateway.umami.is). Hardening: server-only on lib/kit.ts, shadcn to devDependencies, COOP header, SSRF pass for the robots.txt tester.
- Phil to-dos, Umami: dashboard steps DONE. Still open from earlier: IP filter, no Google Ads link, no public share, save Umami DPA and subprocessor PDFs. The signup event counts form submissions; Kit double opt-in makes confirmed subscribers fewer.
- Phil to-dos, privacy: "legitimate interests" basis CONFIRMED 2026-11-18; fill name and contact on /privacy; check Kit DPA lines; review older privacy sentences for writing rule 4.
- Phil to-dos, Kit: confirm form double opt-in; test subscriber should show unconfirmed.
- Newsletter meta description has TODO(phil): weekly cap line. Post og:image alt generic (low priority). No DESIGN.md (suggest /impeccable document).
- keyword-shortlist-and-content-plan.xlsx at repo root, git-ignored (Phil's choice); stays local only.
- Lighthouse not done. Rich Results Test and IndexNow not done.

## Verify before relying on (handoff section 8)
Current ICO/PECR guidance; Umami Hobby limits and EU region on the live dashboard; email provider free limits (cite page and date).

## Next steps
1. Phil: the privacy and Kit to-dos above. Check a real pageview shows in Umami (handoff check still open).
2. Search Console DONE 2026-11-18. Next: Priya writes Bing Webmaster Tools and IndexNow steps.
3. Yuki: F6 CSP. Phil + Quinn: F2 live spoof tests.
4. Merge feat/s00-1-content-first to main (Phil's call on timing); Eleanor and Quinn passes; Lighthouse; Rich Results Test.
5. Before launch: approve or replace the three draft posts; fill /privacy name and contact; set the YouTube URL in lib/social.ts; resolve newsletter meta TODO(phil).
6. Priya: week-1 audience tracker row (handoff item 11).
7. Next build: K03-T1 robots.txt tester (W2-3), with an SSRF pass.
