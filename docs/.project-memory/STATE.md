# STATE

## Since last session (2026-11-19)
- DECISIONS: D-017 (launch with robots.txt tester + 3 posts; tools stay in this app), D-018 (no pnpm monorepo)
- New specs/robots-tools-inputs.md: backlog briefs and constraints for one spec covering the K03-T1 tester and K08-T1 generator; read it before planning
- specs/content-briefs-robots-cloudflare.md: briefs for K08-B5, K08-B6, K08-B7, K03-B4, K03-B5, K08-V3; xlsx Backlog rows 95-100 (local)
- Pruned old "Earlier" block to archive/2026-11.md. No CLAUDE.md or ARCHITECTURE.md changes

## Settled this week (details in DECISIONS.md and archive/2026-11.md)
- Domain live behind Cloudflare, SSL Full; Umami verified; Phil opts out of tracking per browser via /privacy (no ?notrack link)
- Copy voice rewrite (D-016) committed. Railway serves feat/s00-1-content-first (main not merged)

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
- D-016 voice brand-led DECIDED; rewrite committed. Check /privacy still names Phil as controller, consent wording unchanged.
- D-017 launch scope and D-018 no monorepo DECIDED 2026-11-19.
- D4 consent records: proposed provider only (D-008); Astrid to confirm.

## Blockers / flags
- Open for Phil: who builds the tester (Phil via Noor tutorial, or Yuki and Tomas). No launch date set. Launch posts K03-B5, K08-B5, K03-B4 (about 6.5 hrs, briefs in specs/content-briefs-robots-cloudflare.md) replace the three drafts in content/posts/. Open: keep "What a customer checks before they pick up the phone" as a fourth post so get-trusted is not empty. Search volumes for the new queries unchecked (Phil, Keyword Planner). Posts already render SignupBand (newsletter CTA); tool links go in once the tester is live. The "AI-bot rules pack" email offer does not exist yet.
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
1. Marcus: one spec for both robots.txt tools, K03-T1 tester and K08-T1 generator, to docs/specs/ (inputs: specs/robots-tools-inputs.md; D-003, D-007, D-015, D-017). Include shared bot list in lib/ and HTTP status per bot with the Cloudflare caveat.
2. Phil: choose the builder (Noor tutorial, or Yuki and Tomas). Build the tester while Phil writes the three posts.
3. Viktor: SSRF audit of the tester route. Yuki: F6 CSP. Phil + Quinn: F2 live spoof tests.
4. Build the AI-bot rules pack (email offer) from the shared bot list; add tool links to posts; then K03-B1 pillar.
5. Fallback if Phil wants to go live within about 2 weeks: launch with K08-T1 generator (about 6 hrs, no SSRF), add the tester after.
6. Before launch: Phil's privacy and Kit to-dos above; remove the three drafts; set YouTube URL in lib/social.ts; resolve newsletter meta TODO(phil). Merge feat/s00-1-content-first to main (Phil's timing); Eleanor and Quinn passes; Lighthouse; Rich Results Test.
7. Priya: week-1 audience tracker row (handoff item 11); Bing Webmaster Tools and IndexNow steps for Phil. Check a real pageview shows in Umami.
