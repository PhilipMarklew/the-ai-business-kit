# The AI Business Kit

Audience-building hub site. Goal: email subscribers plus social followers. Not revenue.
Hub hosts free tools on isolated pages (/tools/<name>). Theme: AI for small businesses getting found, trusted and run better online.
Owner: Phil. Duration: 12-week plan. Source of truth: keyword-shortlist-and-content-plan.xlsx (NOT yet in repo, see STATE.md).

## Memory
- Read docs/.project-memory/STATE.md first. Pull ARCHITECTURE.md, DECISIONS.md only when needed.
- Active handoff: docs/handoffs/S00-1-site-foundations.md

## Hard constraints
- Spend under GBP 200 total for first 3 months. Prefer free tiers; verify current limits and cite page and date.
- Phil has 5-7 hrs/week. Ongoing admin load counts as cost.
- No outreach, community building, SaaS, affiliate or subscription revenue.
- No LinkedIn. Social: TikTok, YouTube Shorts (main), X (secondary). Video: screen recording plus voiceover, no face.
- Tools live at /tools/<name> as isolated pages. URL pattern and layout must allow this without rework.
- Copy goes through the writing-style-phil skill and stop-slop. Direct, plain, slightly British.
- Do not build llms.txt or FAQ rich-result work (see handoff section 7).

## Stack (confirmed 2026-11-13, do not reopen)
Next.js, React, Tailwind v4, shadcn, pnpm. Hosted on Phil's existing Railway account. Supabase only if it earns its place.
Config via env vars SITE_NAME and SITE_URL (domain not chosen yet).

## Team and handoff rule
Priya pm (memory) | Marcus plan | Yuki build (frontend) | Tomas integrate (backend) | Astrid supabase | Eleanor review | Viktor security | Quinn test | Margot copy | Noor educator.
Substantial output goes to docs/.project-memory/specs/ (or docs/specs/ for Marcus); return path plus 3-5 line summary.
Items needing Phil's logins (Search Console, GA4, social accounts): team writes click-by-click steps, does not attempt them.
