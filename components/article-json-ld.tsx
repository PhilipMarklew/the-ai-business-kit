import { breadcrumbs, JsonLd } from "@/components/json-ld";
import { ORGANIZATION_ID, WEBSITE_ID } from "@/components/organization-json-ld";
import type { Post } from "@/lib/posts";
import { absoluteUrl, authorDisplayName } from "@/lib/site";
import { getTopic } from "@/lib/topics";

/**
 * BlogPosting and BreadcrumbList structured data for a post. Values come from
 * the same frontmatter the page renders, so the two cannot disagree.
 */
export function ArticleJsonLd({ post }: { post: Post }) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const topic = getTopic(post.topic);
  return (
    <>
      <JsonLd
        data={{
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.updated ?? post.date,
          inLanguage: "en-GB",
          mainEntityOfPage: url,
          url,
          image: absoluteUrl(`/blog/${post.slug}/opengraph-image`),
          ...(topic && { articleSection: topic.name }),
          author: { "@type": "Person", name: authorDisplayName, url: absoluteUrl("/about") },
          publisher: { "@id": ORGANIZATION_ID },
          isPartOf: { "@id": WEBSITE_ID },
        }}
      />
      <JsonLd
        data={breadcrumbs([
          ["Home", absoluteUrl("/")],
          ...(topic ? [[topic.name, absoluteUrl(`/topics/${topic.slug}`)] as [string, string]] : []),
          [post.title, url],
        ])}
      />
    </>
  );
}
