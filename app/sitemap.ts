import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { tools } from "@/lib/tools";

const pages = ["/", "/about", "/newsletter", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pages.map((p) => ({ url: absoluteUrl(p) })),
    ...tools.filter((t) => t.published).map((t) => ({ url: absoluteUrl(`/tools/${t.slug}`) })),
  ];
}
