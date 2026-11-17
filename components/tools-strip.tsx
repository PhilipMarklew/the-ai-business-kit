import Link from "next/link";
import { copy } from "@/lib/copy";
import { tools } from "@/lib/tools";

/**
 * Free tools on the home page. Lists published tools; until the first one
 * ships it says what is coming instead of showing an empty grid.
 */
export function ToolsStrip({ headingLevel = "h2" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const live = tools.filter((t) => t.published);
  return (
    <section aria-labelledby="tools-strip" className="rounded-panel border border-line bg-surface p-6 sm:p-10">
      <div className="flex items-baseline justify-between gap-4">
        <Heading id="tools-strip" className="text-headline font-bold">
          {copy.home.toolsHeading}
        </Heading>
        {live.length > 0 && (
          <Link href="/tools" className="shrink-0 font-semibold">
            {copy.home.toolsLink} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      {live.length > 0 ? (
        <ul className="mt-6 divide-y divide-line">
          {live.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/tools/${t.slug}`}
                className="group flex items-center justify-between gap-6 py-4 text-ink hover:text-ink"
              >
                <span>
                  <span className="block font-bold group-hover:underline">{t.title}</span>
                  <span className="block text-muted">{t.description}</span>
                </span>
                <span aria-hidden="true" className="text-xl text-link transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
          <span className="inline-flex h-7 shrink-0 items-center self-start rounded-full bg-raised px-3 text-xs font-bold text-ink">
            In progress
          </span>
          <p className="max-w-[56ch] text-muted">{copy.home.toolsComing}</p>
        </div>
      )}
    </section>
  );
}
