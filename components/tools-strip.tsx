import Link from "next/link";
import { copy } from "@/lib/copy";
import { tools } from "@/lib/tools";

/**
 * Free tools. An open section between two rules, heading on the left and the
 * tool list on the right from tablet up. Until the first tool ships it says
 * what is coming instead of showing an empty list.
 */
export function ToolsStrip({
  headingLevel = "h2",
  heading = copy.home.toolsHeading,
}: {
  headingLevel?: "h2" | "h3";
  heading?: string;
}) {
  const Heading = headingLevel;
  const live = tools.filter((t) => t.published);
  return (
    <section
      aria-labelledby="tools-strip"
      className="grid gap-6 border-t border-line pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-12 md:pt-14"
    >
      <div className="flex flex-col gap-2">
        <Heading id="tools-strip" className="text-headline font-extrabold">
          {heading}
        </Heading>
        {live.length > 0 && (
          <Link href="/tools" className="self-start font-semibold">
            {copy.home.toolsLink}
          </Link>
        )}
      </div>

      {live.length > 0 ? (
        <ul className="divide-y divide-line">
          {live.map((t) => (
            <li key={t.slug}>
              <Link href={`/tools/${t.slug}`} className="group block py-4 text-ink first:pt-0 hover:text-ink">
                <span className="block text-lg font-bold group-hover:underline">{t.title}</span>
                <span className="block text-muted">{t.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-link">{copy.tools.comingHeading}</p>
          <p className="max-w-[56ch] text-lg">{copy.home.toolsComing}</p>
        </div>
      )}
    </section>
  );
}
