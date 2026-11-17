import type { Post } from "@/lib/posts";
import { absoluteUrl, authorDisplayName, site } from "@/lib/site";

/**
 * BlogPosting structured data. Describes the page for search and AI tools;
 * it is clarity, not a ranking promise. Values come from the same frontmatter
 * the page renders, so the two cannot disagree.
 */
export function ArticleJsonLd({ post }: { post: Post }) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    mainEntityOfPage: url,
    url,
    image: absoluteUrl(`/blog/${post.slug}/opengraph-image`),
    author: { "@type": "Person", name: authorDisplayName, url: absoluteUrl("/about") },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped cannot break out of the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
