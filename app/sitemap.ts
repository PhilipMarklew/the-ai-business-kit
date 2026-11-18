import type { MetadataRoute } from "next";
import { getPublishedPosts, type Post } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";
import { tools } from "@/lib/tools";
import { topics } from "@/lib/topics";

/**
 * Published content only. Drafts never appear here, whatever the environment.
 *
 * lastModified is only set where it is true: a post's own date, and for pages
 * that list posts, the newest post they show. Google ignores lastmod once it
 * finds it unreliable, so pages with no real date (About, Privacy) get none.
 */
function newest(posts: Post[]): string | undefined {
  return posts.map((p) => p.updated ?? p.date).sort().at(-1);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPublishedPosts();
  const latest = newest(posts);
  return [
    { url: absoluteUrl("/"), lastModified: latest },
    { url: absoluteUrl("/blog"), lastModified: latest },
    ...topics.map((t) => ({
      url: absoluteUrl(`/topics/${t.slug}`),
      lastModified: newest(posts.filter((p) => p.topic === t.slug)),
    })),
    ...posts.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: p.updated ?? p.date })),
    { url: absoluteUrl("/tools") },
    ...tools.filter((t) => t.published).map((t) => ({ url: absoluteUrl(`/tools/${t.slug}`) })),
    { url: absoluteUrl("/about") },
    { url: absoluteUrl("/newsletter") },
    { url: absoluteUrl("/privacy") },
  ];
}
