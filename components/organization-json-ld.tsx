import { JsonLd } from "@/components/json-ld";
import { copy } from "@/lib/copy";
import { absoluteUrl, authorDisplayName, site } from "@/lib/site";
import { liveSocial } from "@/lib/social";

export const ORGANIZATION_ID = absoluteUrl("/#organization");
export const WEBSITE_ID = absoluteUrl("/#website");

/**
 * Organization JSON-LD with the author as founder, on every page. Built from
 * the same constants as the About page and footer (lib/site.ts), so they
 * cannot drift. Other JSON-LD points at it by @id.
 */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: site.name,
        url: absoluteUrl("/"),
        logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png"), width: 512, height: 512 },
        description: copy.siteDescription,
        founder: { "@type": "Person", name: authorDisplayName, url: absoluteUrl("/about") },
        // Filled from lib/social.ts as each account goes live.
        ...(liveSocial.length > 0 && { sameAs: liveSocial.map((s) => s.url) }),
      }}
    />
  );
}

/**
 * WebSite JSON-LD, home page only. Google reads it to choose the site name
 * shown above each search result.
 */
export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: site.name,
        url: absoluteUrl("/"),
        description: copy.siteDescription,
        inLanguage: "en-GB",
        publisher: { "@id": ORGANIZATION_ID },
      }}
    />
  );
}
