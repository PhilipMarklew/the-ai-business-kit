# Search Console setup for theaibusinesskit.com

Owner: Phil (needs your Google and Cloudflare logins). Written by Priya, 2026-11-18.
Time: about 15 minutes of work, plus waiting for DNS.

## Sources

Read on 18 Nov 2026, Google Search Console Help:
- Add a website property: https://support.google.com/webmasters/answer/34592
- Verify with a DNS record: https://support.google.com/webmasters/answer/9008080
- Build and submit a sitemap: https://support.google.com/webmasters/answer/7451001

Where a screen differs from these steps, follow what the screen shows. Button names below come from those pages. Anything not listed there is described in general terms.

## Checked before you start

Checked 18 Nov 2026:
- https://theaibusinesskit.com/sitemap.xml returns status 200 with type application/xml. It lists 9 URLs.
- robots.txt lists the sitemap line and allows Googlebot.

## Step 1. Add the Domain property

1. Sign in to Google with the account you want to own the site data.
2. Open Search Console. On the welcome page, or in the property selector dropdown at the top left, choose "+ Add property".
3. Choose "Website property", then "Domain property (example.com)".
4. Enter `theaibusinesskit.com`. Use the root domain only. Leave out the protocol and any path. Google says "Don't include a www prefix".
5. Continue. Search Console now shows a verification screen.

A Domain property needs DNS record verification. Data starts to appear a few days after you verify.

## Step 2. Verify with a DNS record

Search Console may offer to add the record for you. Check the provider list on the verification screen.

If Cloudflare appears in the list:
1. Choose Cloudflare.
2. Click "Start verification".
3. Log in to Cloudflare when asked and approve the change.

If Cloudflare does not appear, add the record by hand:
1. On the verification screen, choose "TXT" for "Select record type".
2. Copy the string Search Console shows.
3. In Cloudflare, open theaibusinesskit.com, then DNS, then Records.
4. Click "Add record".
5. Set Type to TXT.
6. Set Name to `@`.
7. Paste the string into Content.
8. Click Save. Cloudflare TXT records have no proxy toggle, so there is nothing to switch.
9. Go back to Search Console and click "Verify".

Timing: verification takes minutes at best and up to two or three days at worst. If it fails, wait a day or two and click "Verify" again.

If you leave before it finishes, choose "Verify later". To resume, select the property in Search Console and click "Verify".

Keep the TXT record in Cloudflare for good. Google states: "To stay verified, don't remove the DNS record."

## Step 3. Submit the sitemap

You need owner permission on the property. You have it if you added it yourself.

1. Optional check: paste https://theaibusinesskit.com/sitemap.xml into the URL Inspection bar at the top and read the result.
2. Open the Sitemaps report.
3. Under "Add a new sitemap", paste `https://theaibusinesskit.com/sitemap.xml`. A Domain property needs the full URL.
4. Click "Submit".

Read the status in the report:
- "Success": Google loaded and processed the sitemap with no errors.
- "Has errors": Google fetched the sitemap and found errors.
- "Couldn't fetch": Google could not fetch the sitemap.

If the status is not "Success", open the row for details and send Priya what it says.

Google fetches the sitemap right away. Crawling the listed pages takes longer.

## After it is set up

1. Open URL Inspection and enter https://theaibusinesskit.com/.
2. If the screen offers "Request indexing", click it. The screen may not offer it, and Google does not promise a result.
3. Tell Priya when Step 3 shows "Success" so she can update STATE.md.

Bing Webmaster Tools and IndexNow come later as separate steps.
