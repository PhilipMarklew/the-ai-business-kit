import Link from "next/link";
import { copy } from "@/lib/copy";

/**
 * Home hero: a large inset banner, always in the dark scheme (`scheme-dark`
 * pins the dark tokens even when the phone is in light mode), lit by the coral
 * gradient in `.hero-glow`. Two actions: read the newest guide, or sign up.
 */
export function HomeHero({ featuredHref }: { featuredHref: string }) {
  return (
    <section
      aria-labelledby="home-title"
      className="scheme-dark hero-glow relative isolate mx-2 mt-2 overflow-hidden rounded-[1.75rem] text-ink sm:mx-4 sm:mt-4 sm:rounded-[2.25rem]"
    >
      <div className="mx-auto flex w-full max-w-page flex-col gap-8 px-5 pb-16 pt-20 sm:px-8 md:pb-24 md:pt-32 lg:min-h-[36rem] lg:justify-end lg:pb-28">
        <h1 id="home-title" className="max-w-[14ch] animate-rise text-hero font-extrabold">
          {copy.home.title}
        </h1>
        <p className="max-w-[44ch] animate-rise text-lg text-ink/85 [animation-delay:90ms] md:text-2xl md:leading-snug">
          {copy.home.intro}
        </p>
        <div className="flex animate-rise flex-wrap gap-3 [animation-delay:180ms]">
          <Link
            href={featuredHref}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 font-bold text-on-accent transition-colors hover:bg-accent-hover hover:text-on-accent"
          >
            {copy.home.heroPrimary} <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="#signup"
            className="inline-flex h-12 items-center rounded-full border border-ink/35 px-6 font-semibold text-ink transition-colors hover:border-ink hover:text-ink"
          >
            {copy.home.heroSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
