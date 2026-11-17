import Link from "next/link";
import { HomeHero } from "@/components/home-hero";
import { LeadStory, PostHeadline, PostList } from "@/components/post-card";
import { SignupAside } from "@/components/signup-band";
import { ToolsStrip } from "@/components/tools-strip";
import { copy } from "@/lib/copy";
import { getPosts } from "@/lib/posts";
import { topics } from "@/lib/topics";

const SIDE_COUNT = 3;
const MORE_COUNT = 6;

/**
 * Home page, laid out like the front page of a publication: the hero, then the
 * latest guides straight away (lead story left, headlines and signup right),
 * then any older guides, then the tools. The signup sits beside the content it
 * offers instead of in a separate banner above the footer.
 */
export default function HomePage() {
  const posts = getPosts();
  const [lead, ...rest] = posts;
  const side = rest.slice(0, SIDE_COUNT);
  const more = rest.slice(SIDE_COUNT, SIDE_COUNT + MORE_COUNT);

  return (
    <>
      <HomeHero featuredHref={lead ? `/blog/${lead.slug}` : "/blog"} />

      <div className="mx-auto w-full max-w-page px-5 sm:px-8">
        <section aria-labelledby="latest-heading" className="pt-14 md:pt-20">
          <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 id="latest-heading" className="text-title font-extrabold">
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

          <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-14">
            {lead ? (
              <LeadStory post={lead} />
            ) : (
              <div className="flex flex-col gap-2">
                <h3 className="text-headline font-extrabold">{copy.home.emptyHeading}</h3>
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
            <h2 id="more-heading" className="mb-8 border-b border-line pb-4 text-title font-extrabold">
              {copy.home.moreHeading}
            </h2>
            <PostList posts={more} />
          </section>
        )}

        <div className="mt-28 md:mt-36">
          <ToolsStrip />
        </div>
      </div>
    </>
  );
}
