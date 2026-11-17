import type { Metadata } from "next";
import { getTool } from "@/lib/tools";
import { absoluteUrl } from "@/lib/site";

/** Per-tool metadata for use as `export const metadata = toolMetadata("slug")`. */
export function toolMetadata(slug: string): Metadata {
  const tool = getTool(slug);
  if (!tool) {
    throw new Error(`No entry in lib/tools.ts for tool "${slug}".`);
  }
  const url = absoluteUrl(`/tools/${tool.slug}`);
  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical: url },
    openGraph: { title: tool.title, description: tool.description, url },
    robots: tool.published ? undefined : { index: false, follow: false },
  };
}
