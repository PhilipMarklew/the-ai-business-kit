import Link from "next/link";
import { Marker } from "@/components/marker";
import { LeadStory, PostHeadline, PostList } from "@/components/post-card";
import { SignupAside } from "@/components/signup-band";
import { ToolsStrip } from "@/components/tools-strip";
import { copy } from "@/lib/copy";
import { getPosts } from "@/lib/posts";
import { topics } from "@/lib/topics";

const SIDE_COUNT = 3;
const MORE_COUNT = 6;

/** Headline with the marker under `mark`. Falls back to plain text if `mark` is not in `title`. */
function MarkedTitle({ title, mark }: { title: string; mark: string }) {
  const at = title.indexOf(mark);
  if (at === -1) return <>{title}</>;
  return (
    <>
      {title.slice(0, at)}
      <Marker>{mark}</Marker>
      {title.slice(at + mark.length)}
    </>
  );
}

/**
 * Home page, content first (Smashing Magazine / HubSpot blog): a short intro
 * with the one marker flourish, then the latest guides on the first screen
 * (lead story left, headlines and signup right), then older guides, then tools.
 */
export default function HomePage() {
  const posts = getPosts();
  const [lead, ...rest] = posts;
  const side = rest.slice(0, SIDE_COUNT);
  const more = rest.slice(SIDE_COUNT, SIDE_COUNT + MORE_COUNT);

  return (
    <>
      <div className="mx-auto w-full max-w-page px-5 sm:px-8">
        <header className="grid gap-4 border-b border-line pb-8 pt-10 md:pt-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-14">
          <h1 className="max-w-[20ch] text-headline font-heading md:text-[clamp(2.25rem,1.4rem+2.2vw,3.25rem)]">
            <MarkedTitle title={copy.home.title} mark={copy.home.titleMark} />
          </h1>
          <p className="max-w-[48ch] text-lg text-muted lg:pb-1">{copy.home.intro}</p>
        </header>

        <section aria-labelledby="latest-heading" className="pt-8 md:pt-10">
          <div className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 id="latest-heading" className="text-title font-heading">
              {copy.home.latestHeading}
            </h2>
            <nav aria-label="Topics">
              <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
                {topics.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/topics/${t.slug}`} className="text-ink hover:text-link">
                      {t.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/blog">{copy.home.allPostsLink}</Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-14">
            {lead ? (
              <LeadStory post={lead} />
            ) : (
              <div className="flex flex-col gap-2">
                <h3 className="text-headline font-heading">{copy.home.emptyHeading}</h3>
                <p className="max-w-[52ch] text-lg text-muted">{copy.home.emptyBody}</p>
              </div>
            )}

            <div className="flex flex-col gap-10">
              {side.length > 0 && (
                <ul className="-mt-5 divide-y divide-line">
                  {side.map((p) => (
                    <li key={p.slug}>
                      <PostHeadline post={p} />
                    </li>
                  ))}
                </ul>
              )}
              <SignupAside />
            </div>
          </div>
        </section>

        {more.length > 0 && (
          <section aria-labelledby="more-heading" className="mt-20 md:mt-24">
            <h2 id="more-heading" className="mb-8 border-b border-line pb-4 text-title font-heading">
              {copy.home.moreHeading}
            </h2>
            <PostList posts={more} />
          </section>
        )}

        <div className="mt-20 md:mt-28">
          <ToolsStrip />
        </div>
      </div>
    </>
  );
}
