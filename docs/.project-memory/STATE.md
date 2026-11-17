# STATE

## Since last session (2026-11-17)
- Project memory bootstrapped: CLAUDE.md, STATE.md, DECISIONS.md, ARCHITECTURE.md (stub)
- ARCHITECTURE.md is a stub; Marcus's note will fill it
- MISSING: keyword-shortlist-and-content-plan.xlsx not in project folder

## Current objective
S00-1 Site foundations. Week 1 of 12. Budget about 6 hrs of Phil's time.
Brief: docs/handoffs/S00-1-site-foundations.md (12 deliverables, acceptance checks in section 6).

## Sequence progress (handoff section 5)
1. Priya: memory bootstrap and plan confirmation. DONE 2026-11-17
2. Marcus: one-page architecture note (URL pattern, /tools layout, hosting, email shortlist with verified limits). IN FLIGHT
2b. Margot (with Priya, Marcus): 5 candidate hub names (D1) with .com availability check. IN FLIGHT
3. Phil: answer D1, D2; buy domain. WAITING on 2 and 2b
4. Noor: minimal visual direction. NOT STARTED
5. Yuki + Tomas build; Margot copy. NOT STARTED
6. Viktor security, Eleanor review, Quinn QA. NOT STARTED
7. Phil: items 9, 10, 12 (Search Console, GA4, social accounts) from team guide. Waits on domain and live URL
8. Priya: week-1 audience tracker row (item 11). NOT STARTED

## Decisions (see DECISIONS.md)
- S00 D3 hosting: DECIDED. Next.js on Phil's Railway account (Vercel Hobby ruled out, non-commercial only). Marcus still to confirm plan covers traffic and cost, and Railway terms allow it.
- S00 D1 hub name and .com: OPEN (Phil). Build proceeds on SITE_NAME / SITE_URL env vars.
- S00 D2 email provider: OPEN (Phil, on Marcus's recommendation). Compare free subscriber cap, double opt-in, export, API, UK GDPR terms.
- S00 D4 consent records in Supabase or provider only: OPEN (Marcus, Astrid recommend). Default: provider only.

## Blockers / flags
- keyword-shortlist-and-content-plan.xlsx (source of truth, Backlog row S00-1) is NOT in the project folder. Needed to set row to Published at the end and for the audience tracker. Ask Phil to add it.
- Repo is not yet a git repo and has no code.
- Domain not bought: blocks handoff items 9 and 10.

## Verify before relying on (handoff section 8)
GA4 menu steps on a live property; current ICO/PECR guidance; bot names on vendor docs; email provider free limits (cite page and date).

## Next steps
1. Marcus delivers architecture note; Margot delivers name candidates.
2. Phil picks name, buys domain, picks email provider.
3. Phil adds the workbook to the project folder.
4. Next: K03-T1 robots.txt tester (W2-3). Site must support server routes and rate-limited outbound fetches.
