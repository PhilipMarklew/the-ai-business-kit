import Image from "next/image";
import Link from "next/link";
import { copy } from "@/lib/copy";
import { heroImage, showHeroPlaceholder } from "@/lib/hero";
import { cn } from "@/lib/utils";

/**
 * Home hero: a large inset banner, always in the dark scheme (`scheme-dark`
 * pins the dark tokens even when the phone is in light mode), lit by the coral
 * gradient in `.hero-glow`. Two actions: read the newest guide, or sign up.
 *
 * Optional image on the right (lib/hero.ts). With an image or the preview
 * placeholder, the text takes the left half from 1024px, the headline steps
 * down a size, and the image bleeds off the right edge. Without either, the
 * hero is text only.
 */
export function HomeHero({ featuredHref }: { featuredHref: string }) {
  const hasMedia = heroImage !== null || showHeroPlaceholder;

  return (
    <section
      aria-labelledby="home-title"
      className="scheme-dark hero-glow relative isolate mx-2 mt-2 overflow-hidden rounded-[1.75rem] text-ink sm:rounded-[2.25rem]"
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-page flex-col gap-12 px-5 pt-20 sm:px-8 md:pt-32 lg:min-h-[38rem]",
          hasMedia ? "pb-0 lg:justify-center lg:pb-24 lg:pt-24" : "pb-16 md:pb-24 lg:justify-end lg:pb-28",
        )}
      >
        <div className={cn("flex flex-col gap-8", hasMedia && "lg:w-1/2 lg:pr-6")}>
          <h1
            id="home-title"
            className={cn(
              "max-w-[14ch] animate-rise text-hero font-extrabold",
              hasMedia && "lg:text-[clamp(3rem,1rem+3.4vw,4.5rem)]",
            )}
          >
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

        {hasMedia && <HeroMedia />}
      </div>
    </section>
  );
}

/**
 * The image bleeds off the right edge of the hero, Runpod style.
 *
 * Desktop: the frame is pinned from the hero's centre line (where the text
 * column ends) and is wider than the space left, so the hero's overflow and
 * rounded corner crop its right side. Phone: it sits under the buttons and
 * runs past the right padding and the bottom edge.
 *
 * The image is cropped from the top-left (object-left-top), so whatever
 * matters in it must sit top-left. A flat screenshot reads as an object placed
 * on the gradient thanks to the border and soft shadow on its left side.
 */
function HeroMedia() {
  const position =
    "-mr-5 sm:-mr-8 lg:absolute lg:inset-y-0 lg:left-[calc(50%+1.5rem)] lg:right-0 lg:mr-0 lg:flex lg:items-center";
  const frame =
    "relative aspect-[4/3] w-[calc(100%+1.25rem)] animate-rise overflow-hidden rounded-l-[1.25rem] border-y border-l border-ink/15 bg-canvas/40 shadow-[-30px_30px_80px_-20px_oklch(0.1_0.02_28/0.8)] [animation-delay:240ms] max-lg:rounded-bl-none max-lg:border-b-0 lg:aspect-auto lg:h-[min(32rem,80%)] lg:w-[54rem] lg:shrink-0";

  if (heroImage) {
    return (
      <div className={position}>
        <div className={frame}>
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            preload
            sizes="(min-width: 1024px) 864px, 100vw"
            className="object-cover object-left-top"
          />
        </div>
      </div>
    );
  }

  // Preview builds only. Never reaches production (see lib/hero.ts).
  return (
    <div className={position}>
      <div className={cn(frame, "flex items-center border-dashed border-ink/40 p-8")}>
        <p className="max-w-[24ch] text-sm text-ink/80">
          <span className="block font-bold text-ink">Hero image slot</span>
          4:3, at least 1600×1200. The right side runs off the edge, so keep what matters top-left.
          <br />
          Set it in <code className="font-mono">lib/hero.ts</code>
        </p>
      </div>
    </div>
  );
}
