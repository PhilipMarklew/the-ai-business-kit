# SEO titles and meta descriptions

Author: Margot. Date: 17 Nov 2026. Status: proposal. No source files were edited.

Lengths are character counts including spaces. The title suffix " | The AI Business Kit" is 22 characters. Meta descriptions target 120-155.

## Home

| Field | Current text | Len | Proposed text | Len |
|---|---|---|---|---|
| title (full, brand included, no suffix added) | The AI Business Kit | 19 | The AI Business Kit: Free AI Guides for Small Business | 54 |
| description | Plain-English guides and free tools that show small business owners how to get useful results from AI. Written and built by Phil. | 129 | Keep as is | 129 |

## About

Source: `lib/copy.ts` (about.body). The page says what the site covers, that everything is free, and that Phil runs it.

| Field | Current text | Len | Proposed text | Len |
|---|---|---|---|---|
| description | Who runs this site and why. | 27 | Phil runs The AI Business Kit: plain-English AI guides and free tools for small businesses. No subscriptions and no affiliate links. | 132 |

## Topic pages (meta description only; visible summary stays)

| Topic | Current (summary) | Len | Proposed meta description | Len |
|---|---|---|---|---|
| get-found | Show up when people search, on Google and in AI tools like ChatGPT. | 67 | Guides for small business owners on showing up when people search, on Google and in AI tools like ChatGPT. Short, practical guides. | 131 |
| get-trusted | Give people a reason to pick you once they land on your site. | 61 | Practical guides on giving visitors a reason to pick your small business once they land on your website, with AI to help where it fits. | 135 |
| run-better | Use AI to take the repetitive work off your plate. | 50 | Practical guides for small business owners on using AI to take repetitive work off your plate, such as answering the same customer emails. | 138 |

## Blog, Tools, Newsletter, Privacy

| Page | Current | Len | Proposed | Len |
|---|---|---|---|---|
| Blog | Plain-English guides on getting found, earning trust and running a small business better with AI. | 97 | Short, practical guides for small business owners on getting found online, earning trust and saving time with AI. Pick a topic or read them all. | 144 |
| Tools | Free tools that each do one job for your small business website. No sign-up needed to use them. | 95 | Free tools that each do one job for your small business website. They run in your browser, cost nothing and need no sign-up. | 124 |
| Newsletter | Free tools and plain guides for small businesses, by email, when each one is ready. | 83 | Get free tools and plain-English guides for small businesses by email when each one is ready. Every email has an unsubscribe link. | 130 |
| Privacy | What data this site collects, why, and how to unsubscribe or ask for it to be deleted. | 86 | How this site handles your data: what it collects, why, who holds it, and how to unsubscribe or ask for your email address to be deleted. | 137 |

Notes:
- Tools: the proposal avoids naming the robots.txt tester, because the copy file still marks it TODO(phil) as unconfirmed.
- Newsletter: the proposal leaves out the "one email a week" cap because it is still TODO(phil). Once Phil confirms it, swap the last sentence for "One email a week at most, and you can leave any time." (147 total).
- Privacy: "who holds it" matches the "Who handles it" section (the email provider).

## Posts

Only post-level fields that need a change. All three posts get an optional `seoTitle`. Two get a `seoDescription`.

### what-customers-check-before-they-call

| Field | Current | Len | Proposed | Len |
|---|---|---|---|---|
| title (with suffix) | What a customer checks before they pick up the phone | 52 (74 with suffix) | unchanged | |
| seoTitle | none | | What customers check before they call you | 41 (63 with suffix) |
| description | People decide whether to trust a small business in a few seconds on its website. These are the things I look for, and the quick fixes for each. | 143 | Fits. No seoDescription needed. | |

### can-chatgpt-read-your-website

| Field | Current | Len | Proposed | Len |
|---|---|---|---|---|
| title (with suffix) | Can ChatGPT read your website? Check one small file first | 57 (79 with suffix) | unchanged | |
| seoTitle | none | | Can ChatGPT read your website? | 30 (52 with suffix) |
| seoDescription | Current description: Before you worry about showing up in AI search, check your robots.txt. It takes two minutes, and a single wrong line in it can stop AI tools reading your site without you ever knowing. | 184 | Before you worry about AI search, check your robots.txt. It takes two minutes, and one wrong line can stop AI tools reading your site. | 134 |

### ai-replies-that-sound-like-you

| Field | Current | Len | Proposed | Len |
|---|---|---|---|---|
| title (with suffix) | Use AI to answer the same customer emails without sounding like a robot | 71 (93 with suffix) | unchanged | |
| seoTitle | none | | AI email replies that sound like you | 36 (58 with suffix) |
| seoDescription | Current description: Most small businesses answer the same ten questions over and over. Here's how I'd get an AI tool to draft those replies in your voice, and what never to paste into it. | 167 | Most small businesses answer the same ten questions over and over. I show how to get an AI tool to draft replies in your voice. | 127 |

All three seoTitles fit under 65 with the suffix, so the suffix can stay on every one. No exception needed.

Implementation hint for the engineer: `seoTitle ?? title` and `seoDescription ?? description` in `generateMetadata`, for the page, Open Graph and Twitter blocks. Keep the visible standfirst on `description`.

## Default share image

| Field | Proposed | Len |
|---|---|---|
| Strapline on the card | Plain-English AI guides and free tools for small business | 57 |
| Card text (name line) | The AI Business Kit | 19 |
| og:image alt | The AI Business Kit: Plain-English AI guides and free tools for small business | 78 |

Shorter strapline option if the card layout is tight: "Get found, get trusted, run better with AI" (42). It echoes the three topic names.

## Checks

- Character counts were done by hand, word by word, with no script available. Re-run `wc -m` on the final strings in code before shipping, since a miscount of one or two is possible.
- The CLAUDE.md writing-rules grep was run against this file. It returned no hits.
- stop-slop self-score: directness 9, rhythm 8, trust 9, authenticity 8, density 9. Total 43/50.
