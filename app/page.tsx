import Link from "next/link";
import { FeaturedPost, PostList } from "@/components/post-card";
import { SignupBand } from "@/components/signup-band";
import { ToolsStrip } from "@/components/tools-strip";
import { TopicNav } from "@/components/topic-nav";
import { copy } from "@/lib/copy";
import { getPosts } from "@/lib/posts";

const LIST_SIZE = 6;

export default function HomePage() {
  const posts = getPosts();
  const [featured, ...rest] = posts;
  const latest = rest.slice(0, LIST_SIZE);

  return (
    <div className="mx-auto w-full max-w-page px-5 sm:px-8">
      <section
        aria-labelledby="home-title"
        className="grid gap-5 pb-10 pt-12 md:pb-12 md:pt-16 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-16"
      >
        <h1 id="home-title" className="max-w-[16ch] animate-rise text-display font-extrabold">
          {copy.home.title}
        </h1>
        <p className="max-w-[46ch] animate-rise text-lg text-muted [animation-delay:90ms] md:text-xl lg:pb-2">
          {copy.home.intro}
        </p>
      </section>

      <TopicNav current="all" />

      {featured ? (
        <div className="mt-10 border-t border-line pt-10 md:mt-12 md:pt-12">
          <FeaturedPost post={featured} />
        </div>
      ) : (
        <section aria-labelledby="home-empty" className="mt-10 rounded-panel border border-line p-6 sm:p-10">
          <h2 id="home-empty" className="text-title font-bold">
            {copy.home.emptyHeading}
          </h2>
          <p className="mt-2 max-w-[52ch] text-muted">{copy.home.emptyBody}</p>
        </section>
      )}

      {latest.length > 0 && (
        <section aria-labelledby="home-latest" className="mt-16 md:mt-20">
          <div className="mb-8 flex items-baseline justify-between gap-4">
            <h2 id="home-latest" className="text-headline font-bold">
              {copy.home.latestHeading}
            </h2>
            <Link href="/blog" className="shrink-0 font-semibold">
              {copy.home.allPostsLink} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <PostList posts={latest} />
        </section>
      )}

      <div className="mt-16 md:mt-24">
        <SignupBand />
      </div>

      <div className="mt-16 md:mt-24">
        <ToolsStrip />
      </div>
    </div>
  );
}
