import type { Metadata } from "next";
import { ToolsStrip } from "@/components/tools-strip";
import { copy } from "@/lib/copy";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: copy.tools.title,
  description: copy.tools.description,
  path: "/tools",
});

/**
 * /tools index. Rendered inside app/tools/layout.tsx, whose heading slot is
 * empty here (no tool segment), so this page supplies its own h1.
 */
export default function ToolsIndexPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-display font-heading">{copy.tools.heading}</h1>
        <p className="max-w-[52ch] text-lg text-muted">{copy.tools.intro}</p>
      </header>
      <ToolsStrip headingLevel="h2" heading={copy.tools.listHeading} />
    </div>
  );
}
