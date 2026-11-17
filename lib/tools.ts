export type Tool = {
  slug: string;
  title: string;
  description: string;
  published: boolean;
};

/**
 * Tool registry. Feeds the sitemap and the tool shell heading.
 * Add a tool: create app/tools/<slug>/page.tsx and add one entry here.
 * Only `published: true` tools appear in the sitemap.
 * Keep this file free of server-only imports: the tool shell heading (client) reads it.
 * Per-page metadata: lib/tool-metadata.ts.
 */
export const tools: Tool[] = [];

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
