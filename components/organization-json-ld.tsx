import { copy } from "@/lib/copy";
import { absoluteUrl, authorDisplayName, site } from "@/lib/site";

/**
 * Organization JSON-LD with the author as founder. Built from the same
 * constants as the About page and footer (lib/site.ts), so they cannot drift.
 * This describes the site clearly to crawlers. It is not a ranking promise.
 */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: site.name,
    url: absoluteUrl("/"),
    description: copy.siteDescription,
    founder: { "@type": "Person", name: authorDisplayName, url: absoluteUrl("/about") },
    // TODO: add sameAs once the TikTok, YouTube and X accounts exist.
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
