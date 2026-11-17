# STATE

## Since last session (2026-11-17, later)
- DECISIONS: D-009 name, D-010 blog scope, D-011 dark brand look added
- ARCHITECTURE: rewritten from repo (blog, topics, content/posts) - re-read if touching structure
- Repo now has code and git history; PRODUCT.md added at repo root
- D2 still open and blocks /api/subscribe

## Current objective
S00-1 Site foundations, now scoped as a blog with tools (D-010). Week 1 of 12. Budget about 6 hrs of Phil's time.
Brief: docs/handoffs/S00-1-site-foundations.md (12 deliverables, acceptance checks in section 6).

## Sequence progress (handoff section 5)
1. Priya memory bootstrap. DONE
2. Marcus architecture note. DONE (docs/specs/S00-1-architecture.md)
2b. Margot name candidates. DONE; Phil chose "The AI Business Kit" (D-009)
3. Phil: D2 email provider OPEN; buy domain NOT DONE
4. Noor visual direction: superseded by Phil's dark brand look (D-011)
5. Yuki build: DONE for scaffold, layout, blog (MDX, topics, share images, sitemap), restyle, 3 draft sample posts. Margot copy and privacy draft committed.
5b. Tomas /api/subscribe: BLOCKED on D2
6. Viktor, Eleanor, Quinn: NOT STARTED
7. Phil: Search Console, GA4, social accounts. Waits on domain and live URL
8. Priya: week-1 audience tracker row (item 11). NOT STARTED

## Decisions (see DECISIONS.md)
- D1 DECIDED (D-009). D3 hosting DECIDED (D-005). D-010 blog scope, D-011 design DECIDED.
- D2 OPEN (Phil): Kit Free (recommended, free, D-006) vs Buttondown ($9/mo).
- D4 consent records: proposed provider only (D-008); Astrid to confirm.

## Blockers / flags
- D2 blocks /api/subscribe.
- Domain not bought (as far as known); blocks handoff items 9 and 10. Unchecked: X and YouTube handles, UK IPO trademark.
- Three draft sample posts in content/posts/ are for layout testing. Phil must approve or replace before live.
- Open TODOs: Margot copy has TODO(phil) and TODO(d2); lib/social.ts profile URLs null (TODO(phil)).
- GA4 cookie consent question open for Viktor. Railway deploy not done. Lighthouse not run.
- keyword-shortlist-and-content-plan.xlsx still not in project folder (needed to set row to Published and for tracker).
- No DESIGN.md; suggest running /impeccable document.

## Verify before relying on (handoff section 8)
GA4 menu steps on a live property; current ICO/PECR guidance; bot names on vendor docs; email provider free limits (cite page and date).

## Next steps
1. Phil answers D2.
2. Tomas builds /api/subscribe.
3. Viktor (incl. GA4 consent), Eleanor, Quinn passes.
4. Phil: approve or replace sample posts, set social URLs, buy domain, add workbook.
5. Deploy to Railway; run Lighthouse.
6. Next: K03-T1 robots.txt tester (W2-3).
