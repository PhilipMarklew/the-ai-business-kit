# Umami dashboard setup

Written 18 Nov 2026. Steps for Phil to do in Umami Cloud. They need your login, so the team has not done them.

Sources: docs.umami.is pages for funnel, goals, journey, track-events and exclude-my-own-visits, read 18 Nov 2026. The docs give button names such as "Add funnel" and "Add goal". They do not show where each screen sits in the menu, so expect small differences in the live dashboard.

## What the site sends today

Checked on the live site on 18 Nov 2026, with the sends blocked so the test did not count.

| Name | When it fires | Data sent with it |
|---|---|---|
| Page view | Every page load and every in-site click to a new page | URL path, with `utm_` tags kept and other query strings removed |
| `signup` | The signup form submits without an error | `placement` (band, home_aside, newsletter_page, tool_page) and `tool` on tool pages |
| `signup_error` | The form rejects the email, or Kit returns an error | `error` (the reason code) |
| `follow_click` | A visitor clicks a TikTok, YouTube or X link | `network`, and `placement` (follow_links or footer) |
| `tool_run` | A tool runs. No tool is live yet, so this never fires today | `tool` (the slug) |

`signup` counts form submissions. Kit uses double opt-in, so some of those people never confirm. Compare the Umami count with confirmed subscribers in Kit to see the gap.

## 1. Exclude your own visits

Do this once in each browser you use, including your phone.

1. Open https://theaibusinesskit.com/privacy#opt-out
2. Press the opt-out button. The tracker stops loading in that browser.

The setting lasts until you clear that browser's site data. Private and incognito windows do not keep it, so your visits count there.

## 2. Content to signup funnel

This shows how many blog readers go on to sign up.

1. Open your website in Umami and go to Funnel.
2. Click **Add funnel**.
3. Name: `Blog to signup`.
4. Step 1: **Viewed page**, value `/blog/*`. The wildcard only works at the end of a value.
5. Step 2: **Triggered event**, value `signup`.
6. Window: `60` minutes. This is the most time allowed between steps.
7. Click **Save**.

Repeat with step 1 set to `/topics/*` and the name `Topic to signup`. Each funnel step takes one value, so the blog and topic pages need a funnel each.

## 3. Signup placement

This needs no setup. It shows which signup form gets used most.

1. Open your website in Umami and go to **Events**.
2. Open the **Properties** tab.
3. Pick the `signup` event, then the `placement` property. You see a count for each form.

To see which pages the signups came from, open the `signup` event and look at the page paths.

## 4. Social follow clicks

This needs no setup either.

1. Go to **Events**, then **Properties**.
2. Pick `follow_click`, then `network` to compare TikTok, YouTube and X.
3. Pick `placement` to see whether people click in the follow block or the footer.

## 5. Tool to signup funnel

Set this up now. It fills with data once the first tool ships and calls `track("tool_run", { tool: "<slug>" })`.

1. Go to Funnel and click **Add funnel**.
2. Name: `Tool to signup`.
3. Step 1: **Viewed page**, value `/tools/*`.
4. Step 2: **Triggered event**, value `tool_run`.
5. Step 3: **Triggered event**, value `signup`.
6. Window: `60` minutes.
7. Click **Save**.

## 6. Goals

Goals give you a quick count on one screen.

1. Go to Goals and click **Add goal**.
2. Add a goal with **Triggered event** set to `signup`.
3. Add a second goal with **Triggered event** set to `follow_click`.
4. Click **Save** after each one.

## 7. Journey, for later

Journey shows the most common paths through the site. Use it when you have a few hundred visits.

1. Go to Journey.
2. Set the steps to 4. The range is 3 to 7.
3. Optional: set **End step** to **Triggered event** `signup` to see the paths that end in a signup.
4. Run it.

## Notes

- The free Hobby plan keeps data for 6 months, per umami.is/pricing, read 18 Nov 2026.
- Funnels and goals work on data you already have, so you can add more later without losing anything.
