# STATE

## Since last session (2026-11-18)
- Kit sign-up built and tested by Phil (route, lib/kit.ts, subscribe.ts, rate-limit.ts). Viktor audit: specs/security-audit-S00-1.md; F1 fixed
- Analytics decided: Umami Cloud (D-013), replaces GA4; built by Yuki, privacy copy rewritten by Margot
- ARCHITECTURE: updated (subscribe, rate limit, analytics) - re-read if touching API or analytics
- Committed 2026-11-18 on feat/s00-1-content-first as three commits: SEO pass (764ab4b), sign-up (f8e18ac), analytics (this one). Not pushed.

## Current objective
S00-1 Site foundations, now scoped as a blog with tools (D-010). Week 1 of 12. Budget about 6 hrs of Phil's time.
Brief: docs/handoffs/S00-1-site-foundations.md (12 deliverables, acceptance checks in section 6).

## Sequence progress (handoff section 5)
1. Priya memory bootstrap. DONE
2. Marcus architecture note. DONE (docs/specs/S00-1-architecture.md)
2b. Margot name candidates. DONE; Phil chose "The AI Business Kit" (D-009)
3. Phil: D2 DONE (Kit Free); buy domain NOT DONE (Phil: soon)
4. Noor visual direction: superseded by Phil's dark brand look (D-011)
5. Yuki build: DONE for scaffold, layout, blog (MDX, topics, share images, sitemap), restyle, 3 draft sample posts. Margot copy and privacy draft committed.
5b. Tomas /api/subscribe: DONE 2026-11-18 (Kit v4, committed). Phil's real test signup works; Kit API works on free plan. Rate-limit per-IP check skipped when X-Real-IP missing.
5d. Yuki analytics + Margot privacy copy: DONE 2026-11-18, committed.
6. Viktor audit DONE (specs/security-audit-S00-1.md). Eleanor, Quinn: NOT STARTED
7. Phil: Search Console, Umami setup (replaces GA4), social accounts. Waits on domain and live URL
8. Priya: week-1 audience tracker row (item 11). NOT STARTED
5c. Yuki SEO hardening: DONE 2026-11-17, committed 2026-11-18. Margot meta copy applied (specs/seo-meta-copy.md).

## Decisions (see DECISIONS.md)
- D1 DECIDED (D-009). D3 hosting DECIDED (D-005). D-010 blog scope, D-011 design DECIDED.
- D2 DECIDED: Kit Free (D-006). D-013 analytics: Umami Cloud.
- D4 consent records: proposed provider only (D-008); Astrid to confirm.

## Blockers / flags
- Domain not bought; blocks deploy, Umami site setup and Search Console. Handles and trademark clear.
- Three draft sample posts in content/posts/ need Phil's approval or replacement before live.
- lib/social.ts: X set (x.com/TheAIBizKit); TikTok and YouTube URLs null.
- Security audit open items: F2 live X-Real-IP spoof and shared-bucket tests (Phil + Quinn, after deploy); F3, F4, F5 (Tomas, deferred by Phil); F6 CSP (Yuki: script-src cloud.umami.is, connect-src gateway.umami.is). Hardening: server-only on lib/kit.ts, shadcn to devDependencies, COOP header, SSRF pass for the robots.txt tester.
- Phil to-dos, Umami: create with EU REGION (permanent); set NEXT_PUBLIC_UMAMI_WEBSITE_ID (placeholder "paste-id-here" in .env.local) and on Railway; save Umami DPA and subprocessor PDFs; dashboard: IP filter, no Google Ads link, no public share, 60-minute funnel window.
- Phil to-dos, privacy: confirm "legitimate interests" basis; fill name and contact on /privacy; check Kit DPA lines; review older privacy sentences for writing rule 4.
- Phil to-dos, Kit: confirm form double opt-in; test subscriber should show unconfirmed.
- Newsletter meta description has TODO(phil): weekly cap line. Post og:image alt generic (low priority). No DESIGN.md (suggest /impeccable document).
- keyword-shortlist-and-content-plan.xlsx at repo root, git-ignored (Phil's choice); stays local only.
- Railway deploy and Lighthouse not done.

## Verify before relying on (handoff section 8)
Current ICO/PECR guidance; Umami Hobby limits and EU region on the live dashboard; email provider free limits (cite page and date).

## Next steps
1. Phil: buy domain; work through the to-dos above.
2. Deploy to Railway on the real domain (set env vars incl. KIT_FORM_ID numeric, Umami ID; redeploy after changing the ID). Choose www or apex and redirect the other.
3. Then: F2 live tests (Phil + Quinn), CSP (Yuki), Eleanor and Quinn passes, Search Console and Bing, submit /sitemap.xml, Lighthouse, Rich Results Test, IndexNow.
4. Priya: week-1 audience tracker row (handoff item 11).
5. Next build: K03-T1 robots.txt tester (W2-3), with an SSRF pass.
