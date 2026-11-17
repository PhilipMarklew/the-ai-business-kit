# ARCHITECTURE (updated 2026-11-17, from repo layout and git log; verify at each wrap-up)
Stack: Next.js (app router), Tailwind v4, shadcn, pnpm. Host: Railway (D-005). Config: server-only SITE_NAME, SITE_URL (D-004).
Product and brand context: PRODUCT.md. Original architecture spec: docs/specs/S00-1-architecture.md.

## Layout
- app/: page.tsx, about, privacy, newsletter, blog (+ /blog/<slug>), topics (/topics/<slug>), tools (index + /tools/<slug>), robots.ts, sitemap.ts, not-found.tsx, globals.css (theme tokens)
- components/: site-header/footer, post-card/cover, listing-header, topic-nav, tools-strip, signup-form/band, follow-links, organization-json-ld, article-json-ld, tool-shell-heading, ui/ (shadcn)
- content/posts/: MDX posts. Frontmatter: title, description, topic, date, updated, draft.
- lib/: site.ts (env config), posts.ts + mdx.tsx (post loading and render), topics.ts (3 topics: Get found, Get trusted, Run better), tools.ts (tool registry), tool-metadata.ts, copy.ts (Margot copy), social.ts (profile URLs, all null), subscribe-client.ts

## Rules
- Drafts: shown in dev or SHOW_DRAFTS=true; always noindex; never in sitemap.
- Per-post share images via next/og.
- Theme: dark default, light follows phone setting; coral accent oklch(0.72 0.16 28); Manrope via next/font.
- Follow links stay hidden until lib/social.ts URLs are set.
- Rate limiting: lib/rate-limit.ts planned (D-007); not yet in repo.
- /api/subscribe: not built; blocked on D2.
