# Content briefs: robots.txt and Cloudflare cluster

Written 2026-11-18. Phil writes the posts. These briefs set the target query, outline and links for each one.
Backlog IDs match the rows added to keyword-shortlist-and-content-plan.xlsx (Backlog tab, rows 95-100).

## Ground rules for every post in this cluster

- Brand voice (D-016): no "I", no "we". Tell the Cloudflare story as "this site" ("When this site went live, its robots.txt had about 30 rules nobody wrote").
- Writing rules in CLAUDE.md apply. Run the grep checks before publishing.
- Topic: get-found for all of them.
- Search volumes for the new target queries are unchecked. Run them through Keyword Planner before you commit hours. These posts earn their place through first-hand experience and links to the tester, so they are worth writing even at 10-100 searches.
- Cloudflare renames dashboard menus often. Every post that names a setting gives the date checked and links the Cloudflare doc. Recheck before each update.

## Cloudflare facts to build on (checked 2026-11-18)

Source: [Cloudflare docs, managed robots.txt](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/), last updated 2026-11-02.

- The feature is called **Bot Preference Sync**. It writes robots.txt rules from three policies: Search, Agent and Training.
- It only adds rules when at least one policy is set to Block, "Block on pages with ads" or (Training only) Disallow. Otherwise your file goes out unchanged.
- If your server already has a robots.txt, Cloudflare puts its rules **above** yours and serves both as one file. If you have none, Cloudflare creates one.
- The added block includes a Content Signals comment (search, ai-input, ai-train), a `User-Agent: *` line with `Content-signal: search=yes, ai-train=no`, and `Disallow: /` for Amazonbot, Applebot-Extended, Bytespider, CCBot, ClaudeBot, Google-Extended, GPTBot and meta-externalagent.
- Dashboard path at time of writing: Security Settings, filter by Bot traffic, AI Crawler and Agent access policies.
- robots.txt is a request. Cloudflare's docs point to AI Crawl Control for blocks it enforces.
- Available on all plans, including Free.

This site's own record: D-015 in DECISIONS.md (sync off, Training policy Block, training bots get 403 at the edge, search bots get 200).

---

## K08-B5 | Cloudflare may be adding rules to your robots.txt: how to check and fix it

**Priority 1. Launch post. About 3 hrs.**

- Target query: cloudflare robots.txt
- Secondary: cloudflare managed robots.txt, cloudflare bot preference sync, robots.txt changed by itself, content-signal robots.txt
- Reader: a small-business owner or web designer who opened their robots.txt and found rules they never wrote. Many don't know their site sits behind Cloudflare.

Outline:
1. What happened on this site: the live file had about 30 extra lines. Show a trimmed before screenshot.
2. How to tell if your site is behind Cloudflare (response headers `server: cloudflare` and `cf-ray`, or ask your host).
3. How to compare the live file with yours: open yoursite.com/robots.txt, then look at the file in your site code or CMS. Lines above yours that mention Content-signal are Cloudflare's.
4. What those lines do, in one short paragraph per group (Content Signals comment, the `User-Agent: *` signal, the Disallow list).
5. How to turn it off, step by step, with the date checked.
6. How to confirm the fix: reload the live file, purge cache if it still shows the old version.
7. Should you turn it off? One short paragraph, then link to K08-B6 for the full decision.

Needs to compete: real screenshots from this site, exact setting names with a checked date, a clear way to tell "my rules" from "Cloudflare's rules".
Links to: K08-B6, K03-B4, can-chatgpt-read-your-website (rewritten), tester once live.
Email CTA: the AI-bot rules pack (same as K03-T1).

## K08-B6 | Cloudflare's AI crawler settings explained, and when to let it manage robots.txt

**Priority 2. About 4 hrs.**

- Target query: cloudflare block ai bots
- Secondary: cloudflare ai crawl control, cloudflare bot fight mode ai, should i let cloudflare manage robots.txt
- Reader: someone who has found the settings and wants to know what each one does before touching it.

Outline:
1. The difference between asking and blocking: robots.txt asks bots to stay away; a firewall block stops the request. Cloudflare offers both.
2. One section per setting: Bot Preference Sync (managed robots.txt), the Search, Agent and Training policies, AI Crawl Control, Bot Fight Mode. For each, say what it does and what it can break. Give its default in a table at the end.
3. When to let Cloudflare manage robots.txt: you never edit the file, and you are happy with Cloudflare's bot list and its updates.
4. When to own the file in your code. Main reason: you want every rule written down with a reason. A second case: you need to allow a bot that Cloudflare's list blocks.
5. What this site chose and why (D-015), with the trade-off on Google-Extended.

Needs to compete: plain explanations of each setting, a clear rule for choosing, a checked date on every menu name. Keep to bot settings only; leave the rest of the dashboard out.
Links to: K08-B5, K08-B1, K08-B7, K08-T1 generator once live.
Email CTA: monthly bot-list update email (from K08-T1).

## K08-B7 | Your robots.txt allows a bot, but it still gets blocked

**Priority 2. About 3 hrs.**

- Target query: robots.txt allowed but blocked
- Secondary: gptbot 403, cloudflare blocking googlebot, ai crawler 403 forbidden
- Reader: someone whose robots.txt looks right but a bot or tool reports it as blocked.

Outline:
1. robots.txt is a note the bot chooses to read. A firewall rule stops the request before the bot reads anything.
2. Where blocks happen: Cloudflare or other CDN, the host's firewall, security plugins (Wordfence and similar), server rules.
3. What this site saw: training bots get 403 at the edge, search bots get 200 (D-015).
4. How to check: look at the HTTP status. 200 means the bot got the page. 403 means something blocked it.
5. Why testing tools can mislead: a tool that pretends to be GPTBot sends requests from its own server. Cloudflare checks real bots by IP address, so the fake request can get a different answer than the real bot.

Needs to compete: the asking-versus-blocking idea explained in plain terms, a short list of the usual causes, a way to check.
Links to: K08-B6, K03-T1 tester, K03-B2.
Email CTA: AI-bot rules pack.

## K03-B4 | This site's robots.txt, line by line

**Priority 1. Launch post. About 2 hrs.**

- Target query: robots.txt example
- Secondary: robots.txt block ai training allow ai search, robots.txt allow oai-searchbot, block google-extended
- Reader: someone who wants a real file to copy and the reason behind each rule.

Outline:
1. The full file, shown as served.
2. Each group of rules with one or two sentences on why: search bots allowed, training bots disallowed, user-triggered agents allowed.
3. The Google-Extended trade-off: it also covers Gemini grounding, and Google says it does not affect Google Search ranking.
4. Why the file lives in code and Cloudflare's version is off (one paragraph, link to K08-B5).
5. How to adapt it for your site, and a reminder to test after any change.

Needs to compete: a real live file with reasons, kept up to date. Add an "updated on" date and change it when the file changes.
Links to: K08-B5, K08-B1, generator and tester once live.
Email CTA: AI-bot rules pack.

## K03-B5 | Rewrite of the draft "Can ChatGPT read your website? Check one small file first"

**Priority 1. Launch post. About 1.5 hrs.**

The draft at content/posts/can-chatgpt-read-your-website.mdx already targets this cluster. Keep the slug. Changes:
- Rewrite in brand voice (D-016).
- Split ChatGPT's bots by job: GPTBot (training), OAI-SearchBot (search), ChatGPT-User (fetches a page when a user asks). The post should say which one matters for showing up in answers.
- Add a short section on Cloudflare adding rules, linking to K08-B5.
- Swap any manual check steps for the tester once it is live. Until then, keep the manual check.

## K08-V3 | Short: "This robots.txt rule was never in the code"

**Priority 2. About 1 hr.**

Platform: TikTok and YouTube Shorts. Screen recording and voiceover.
Beats: open the live robots.txt and scroll the Cloudflare block. Open the code file, which is much shorter. Show the setting and switch it off. Reload the live file. CTA: full guide at the link in bio (K08-B5).
Use this site only.

---

## Suggested launch set (replaces the three drafts)

1. K03-B5 rewrite of can-chatgpt-read-your-website
2. K08-B5 Cloudflare check-and-fix guide
3. K03-B4 this site's robots.txt, line by line

About 6.5 hrs in total. All three are get-found. The get-trusted and run-better topics will have no posts at launch unless "What a customer checks before they pick up the phone" stays in as a fourth post. That is Phil's call.

## Tester feature idea (for Marcus's K03-T1 spec)

Besides parsing the rules, fetch the page as each bot and report the HTTP status. The page must explain that the request comes from this site's server and that real bots can get a different answer (see K08-B7). Ties the tester to K08-B7.
