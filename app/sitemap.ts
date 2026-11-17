import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";
import { tools } from "@/lib/tools";
import { topics } from "@/lib/topics";

const pages = ["/", "/blog", "/tools", "/about", "/newsletter", "/privacy"];

/** Published content only. Drafts never appear here, whatever the environment. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pages.map((p) => ({ url: absoluteUrl(p) })),
    ...topics.map((t) => ({ url: absoluteUrl(`/topics/${t.slug}`) })),
    ...getPublishedPosts().map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: p.updated ?? p.date,
    })),
    ...tools.filter((t) => t.published).map((t) => ({ url: absoluteUrl(`/tools/${t.slug}`) })),
  ];
}
