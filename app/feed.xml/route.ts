import { copy } from "@/lib/copy";
import { FEED_PATH } from "@/lib/metadata";
import { getPublishedPosts } from "@/lib/posts";
import { absoluteUrl, authorDisplayName, site } from "@/lib/site";

/**
 * RSS 2.0 feed of published posts, built at build time. Feed readers use it,
 * and search engines can read it to find new posts sooner. Every page links to
 * it with <link rel="alternate"> (lib/metadata.ts).
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 822 date, as RSS requires. Post dates are whole days, read as UTC. */
function rssDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toUTCString();
}

export function GET() {
  const posts = getPublishedPosts();
  const items = posts
    .map((p) => {
      const url = absoluteUrl(`/blog/${p.slug}`);
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(p.description)}</description>
      <pubDate>${rssDate(p.date)}</pubDate>
      <dc:creator>${escapeXml(authorDisplayName)}</dc:creator>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${escapeXml(copy.siteDescription)}</description>
    <language>en-gb</language>
    <atom:link href="${absoluteUrl(FEED_PATH)}" rel="self" type="application/rss+xml"/>${
      posts[0] ? `\n    <lastBuildDate>${rssDate(posts[0].updated ?? posts[0].date)}</lastBuildDate>` : ""
    }
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
