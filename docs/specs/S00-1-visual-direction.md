# Spec: S00-1 Visual direction
Date: 2026-11-17 | Author: Noor | Status: Draft for Phil | Feeds: Yuki (apply after skeleton)

## Direction in one line
A plain, warm page that loads at once on a phone. Paper background, near-black text, one burnt-orange accent used only for things you can press. No logo: the name is set in type (`site.name`, so it follows D1 and `SITE_NAME`).

Why this and not the default: most AI-tool sites are white or near-black with violet-to-blue gradients. A warm off-white with a rust accent reads as "a person made this", which suits a hub that sells trust, and it needs no images, so it costs no bytes.

## Colour
One accent. Neutrals are tinted warm (hue ~60-85) so they sit with the accent. Contrast ratios were computed by script from the OKLCH values converted to sRGB (WCAG 2.x formula), 17 Nov 2026. All values are inside the sRGB gamut, so the hex is exact, not clipped.

| Role | Light OKLCH | Light hex | Dark OKLCH | Dark hex |
|---|---|---|---|---|
| paper (page) | 0.985 0.006 85 | #fcfaf6 | 0.18 0.008 60 | #14110e |
| surface (cards, input bg) | 0.96 0.008 85 | #f4f1ec | 0.23 0.01 60 | #211c18 |
| ink (text) | 0.22 0.012 60 | #1f1915 | 0.95 0.006 85 | #f0eeea |
| muted (secondary text) | 0.48 0.012 60 | #635c57 | 0.74 0.01 70 | #afaaa4 |
| accent | 0.52 0.16 38 | #b13c11 | 0.72 0.14 45 | #eb8656 |
| accent-hover | 0.46 0.15 38 | #992e01 | (use accent, lighten via opacity) | |
| on-accent (button text) | 1 0 0 | #ffffff | 0.18 0.008 60 | #14110e |
| line (decorative rules) | 0.88 0.01 80 | #dbd7d0 | 0.30 0.01 60 | not checked, decorative |

WCAG AA needs 4.5:1 for normal text and 3:1 for UI boundaries.

| Pair | Ratio | Result |
|---|---|---|
| light ink on paper | 16.7 | AAA |
| light muted on paper | 6.3 | AA |
| light accent text/links on paper | 5.7 | AA |
| light accent text on surface | 5.3 | AA |
| light white on accent (button) | 6.0 | AA |
| light white on accent-hover | 7.7 | AAA |
| dark ink on paper | 16.2 | AAA |
| dark muted on paper | 8.2 | AAA |
| dark accent on paper | 7.2 | AAA |
| dark accent on surface | 6.5 | AA |
| dark on-accent text on accent (button) | 7.2 | AAA |

Rules that follow from the numbers:
- Light accent on a dark ink background fails (2.9). Never put accent text on ink.
- `line` is 1.4:1 against paper. Use it for rules only. The email input border must be `muted` (6.3), or the field fails the 3:1 UI-boundary check.
- Dark mode is worth shipping because it costs only the variable overrides below and follows the visitor's phone setting. No toggle, no stored preference, no flash.

## Type
**System font stack. No web font.**
- Zero layout shift by construction: no font swap, nothing to load. `next/font` also gives no shift (checked in the Next.js fonts doc, 27 May 2026 revision), but it still adds a file to download on a cold TikTok visit and a build step to maintain.
- Fastest first paint on a phone, which is where the audience arrives.
- Cost: look varies by device (San Francisco, Roboto, Segoe UI). Accept it. Character comes from size, weight and the accent, not the face.
- Upgrade path: if Phil later wants a fixed face, add one variable font via `next/font/local` and point `--font-sans` at it. Nothing else changes.

Scale: Tailwind defaults, plus one display size. Body is 1.0625rem (17px) on mobile so text is readable without zooming. Headings are `font-semibold`, tight tracking, never gradient text.

## Tokens (paste into `app/globals.css`, after `@import "tailwindcss";`)
Colours live in plain variables so dark mode is one media query. `@theme inline` points the Tailwind utilities at those variables (the Tailwind docs say to use `inline` when a theme variable references another variable). Spacing keeps Tailwind's default 0.25rem step.

```css
:root {
  --paper: oklch(0.985 0.006 85);
  --surface: oklch(0.96 0.008 85);
  --ink: oklch(0.22 0.012 60);
  --muted: oklch(0.48 0.012 60);
  --accent: oklch(0.52 0.16 38);
  --accent-hover: oklch(0.46 0.15 38);
  --on-accent: oklch(1 0 0);
  --line: oklch(0.88 0.01 80);
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --paper: oklch(0.18 0.008 60);
    --surface: oklch(0.23 0.01 60);
    --ink: oklch(0.95 0.006 85);
    --muted: oklch(0.74 0.01 70);
    --accent: oklch(0.72 0.14 45);
    --accent-hover: oklch(0.78 0.13 45);
    --on-accent: oklch(0.18 0.008 60);
    --line: oklch(0.30 0.01 60);
  }
}

@theme inline {
  --color-paper: var(--paper);
  --color-surface: var(--surface);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-on-accent: var(--on-accent);
  --color-line: var(--line);
}

@theme {
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;

  --text-display: clamp(2rem, 1.4rem + 3vw, 3.25rem);
  --text-display--line-height: 1.08;
  --text-display--letter-spacing: -0.02em;

  --container-measure: 40rem;  /* max-w-measure: reading column, ~65 characters */
  --container-page: 68rem;     /* max-w-page: header, footer, wide sections */

  --radius-control: 0.5rem;    /* rounded-control: buttons, inputs, cards */
}

@layer base {
  html { background: var(--paper); color: var(--ink); font-family: var(--font-sans); font-size: 106.25%; }
  a { color: var(--accent); text-underline-offset: 0.2em; }
  a:hover { color: var(--accent-hover); }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
}
```

Notes for Yuki:
- `--accent-hover` in dark is a guess at "slightly lighter". I checked its ratio only in light mode. Check it before use, or drop the hover colour in dark.
- The two spacing/width tokens are the only additions. Page gutter is `px-5` on mobile, `sm:px-8` above. Section rhythm: `py-12` mobile, `md:py-20`. Do not add a custom spacing scale.
- shadcn: if `shadcn init` wrote its own `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--border`, `--ring`, point them at these variables (`--background: var(--paper)` and so on). Do not keep a second palette. Check the names against the generated file; I did not verify them.
- Body copy sits in `max-w-measure`. Headers and footers sit in `max-w-page`. Everything is a single column below `md`.

## Signup placement
One form component, one consent line, three homes. The form is a single email field plus a button (button text from Margot). Consent wording sits directly under the button, in `text-sm text-muted`, as the architecture spec requires. Inline errors appear below the field. It is never a modal, never a pop-up, never sticky.

| Where | Treatment |
|---|---|
| Home | One block, after the hero and the "what you will find" section, so a visitor reads one reason to subscribe before being asked. The hero itself carries a text link to `/newsletter`, not a form. |
| `/newsletter` | The form is the page. Short headline, three lines on what arrives and how often, then the form above the fold on a 375px-wide phone. |
| `/tools/<name>` (in `app/tools/layout.tsx`) | Below the tool, never above or beside it. The person came to use the tool, so the tool comes first. Block sits on `surface` with a one-line heading that names what they just did ("Got a result? Get the next tool by email."). Same component, no different logic. |

Not on About or Privacy. The footer carries a text link to `/newsletter`, not a form.

## Header and footer
- **Header:** wordmark (`site.name`, semibold, links to `/`), then `About` and `Newsletter` as plain text links. No hamburger: two links fit on a phone. No tools menu until there are 3 or more tools (matches the no-index-page decision in S-001 D-003). No sign-in, no search, no theme toggle. Not sticky: sticky bars eat a phone screen.
- **Footer:** the name and the year, links to `About`, `Newsletter`, `Privacy`, a link to X and to YouTube and TikTok once the accounts exist (text links, no icon wall), and one line saying who runs it ("Built by Phil, [surname if Phil wants it]"). Phil confirms the named-author wording to match About and the JSON-LD.

## 404 tone
Short, plain, a little dry. Say what happened and give a way out. No "Oops", no joke about robots, no illustration. Example direction for Margot to write: headline "That page is not here." One line: "It may have moved, or the link was wrong." Two links: Home and Newsletter. Status code must be a real 404.

## Don'ts (what makes a site look generated)
1. No purple, indigo or blue-to-violet gradients, and no gradient text. One flat accent only.
2. No glassmorphism hero, no blurred blobs behind the headline, no glowing borders.
3. No sparkle or magic-wand icons, and no stock "robot brain" art. The AI theme comes from the copy, not from icons.
4. No three-icon "features" grid with identical cards, and no fake logo strip or invented testimonials. There are no customers to show yet.
5. No pop-ups, exit-intent modals or sticky signup bars. Also no cookie-banner design work from this spec: whether one is needed depends on the GA4 setup and the PECR advice, so that goes to Margot and Viktor.

## Verify
- Run Lighthouse mobile on `/`: accessibility should show no contrast failures, and CLS 0.
- In Chrome DevTools, Rendering panel, set "Emulate CSS media feature prefers-color-scheme" to dark and check every page.
- Tab through the header and the form: the focus ring must be visible on every control.
- Test at 360px width. The form must show without scrolling on `/newsletter`.

## Unverified
Look, feel and warmth are Phil's call, and I have not seen the rendered result. The rust accent is a judgement: if it reads too close to a warning colour in the form error state, make errors `text-ink` with a leading "Error:" label rather than a red. The Tailwind default `dark:` variant behaviour was not checked, because this spec avoids it and uses a CSS media query instead.
