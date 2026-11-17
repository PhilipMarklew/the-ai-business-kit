# The AI Business Kit

Audience-building hub site. Goal: email subscribers plus social followers. The site earns no revenue.
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
- Copy goes through the writing-style-phil skill and stop-slop. Direct, plain, slightly British. The "Writing rules (non-negotiable)" section below overrides both.
- Do not build llms.txt or FAQ rich-result work (see handoff section 7).

## Writing rules (non-negotiable)

These apply to ALL written content in this project: page copy, blog posts, headings, meta descriptions, emails, social bios, video scripts, docs and code comments meant for readers. They override any other style guidance, including skills. Check every piece against them before handing it over. No exceptions, even when a sentence "sounds better" breaking one.

1. **Never use "quietly" as an adverb.** The one exception: the thing it describes makes a real sound, and you are literally saying it makes that sound at a lower volume ("the fan runs quietly"). "Quietly shut you out", "quietly changing", "quietly confident" are all banned. Say what actually happens.
2. **Never write comparison sentences that set up a contrast to knock it down.** Banned shapes include "Not X, but Y", "Not X, or Y, but Z", "X, not Y", "It doesn't just X. It Y", "It's not about X, it's about Y", "Less X, more Y" and "X rather than Y" used for effect. State the point directly: say what the thing is or what to do.
3. **Headings must describe the section in plain human terms.** A heading tells the reader what the section covers. Never use two short clipped sentences or fragments ("Fast. Simple.", "Plain first. No hype."), and never a vague or clever label that only makes sense after reading the section ("The file that decides"). Test: could someone skimming the headings alone say what each section is about?

Quick check before handing over copy:
`grep -rniE "quietly|, not |\bnot [a-z ]+, but|rather than|(doesn't|isn't|not) just" <files>` then read every hit, and read the headings on their own.

## Stack (confirmed 2026-11-13, do not reopen)
Next.js, React, Tailwind v4, shadcn, pnpm. Hosted on Phil's existing Railway account. Supabase only if it earns its place.
Config via env vars SITE_NAME and SITE_URL (domain not chosen yet).

## Team and handoff rule
Priya pm (memory) | Marcus plan | Yuki build (frontend) | Tomas integrate (backend) | Astrid supabase | Eleanor review | Viktor security | Quinn test | Margot copy | Noor educator.
Substantial output goes to docs/.project-memory/specs/ (or docs/specs/ for Marcus); return path plus 3-5 line summary.
Items needing Phil's logins (Search Console, GA4, social accounts): team writes click-by-click steps, does not attempt them.
