/**
 * Renders schema.org structured data. JSON.stringify output with "<" escaped
 * cannot break out of the script tag.
 *
 * Structured data describes a page to search engines and AI tools. It makes
 * the page eligible for richer results; it does not promise them.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** BreadcrumbList from [name, absolute URL] pairs, home first. */
export function breadcrumbs(items: [name: string, url: string][]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })),
  };
}
