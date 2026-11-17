"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { getTool } from "@/lib/tools";

/**
 * Title slot for the tool shell. Reads the tool from the URL segment and the
 * registry in lib/tools.ts, so a tool's page.tsx only has to render its body.
 */
export function ToolShellHeading() {
  const slug = useSelectedLayoutSegment();
  const tool = slug ? getTool(slug) : undefined;
  if (!tool) return null;
  return (
    <div className="mb-8 flex flex-col gap-2">
      <h1 className="text-display font-extrabold">{tool.title}</h1>
      <p className="max-w-[52ch] text-lg text-muted">{tool.description}</p>
    </div>
  );
}
