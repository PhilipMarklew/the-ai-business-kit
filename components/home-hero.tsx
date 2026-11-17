import Image from "next/image";
import Link from "next/link";
import { copy } from "@/lib/copy";
import { HERO_IMAGE_RATIO, heroImage, showHeroPlaceholder } from "@/lib/hero";
import { cn } from "@/lib/utils";

/**
 * Home hero: a large inset banner, always in the dark scheme (`scheme-dark`
 * pins the dark tokens even when the phone is in light mode), lit by the coral
 * gradient in `.hero-glow`. Two actions: read the newest guide, or sign up.
 *
 * Optional image on the right (lib/hero.ts). With an image or the preview
 * placeholder, the hero splits into two columns from 1024px and the headline
 * steps down a size so both sides balance. Without either, it is text only.
 */
export function HomeHero({ featuredHref }: { featuredHref: string }) {
  const hasMedia = heroImage !== null || showHeroPlaceholder;

  return (
    <section
      aria-labelledby="home-title"
      className="scheme-dark hero-glow relative isolate mx-2 mt-2 overflow-hidden rounded-[1.75rem] text-ink sm:mx-4 sm:mt-4 sm:rounded-[2.25rem]"
    >
      <div
        className={cn(
          "mx-auto grid w-full max-w-page gap-12 px-5 pb-16 pt-20 sm:px-8 md:pb-24 md:pt-32 lg:min-h-[36rem] lg:pb-28",
          hasMedia ? "lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:pt-24" : "lg:items-end",
        )}
      >
        <div className="flex flex-col gap-8">
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
 * The image sits in a framed panel with a soft shadow, so a flat screenshot
 * reads as an object placed on the gradient, not pasted onto it.
 */
function HeroMedia() {
  const frame =
    "animate-rise overflow-hidden rounded-[1.25rem] border border-ink/15 bg-canvas/40 shadow-[0_30px_80px_-20px_oklch(0.1_0.02_28/0.8)] [animation-delay:240ms]";

  if (heroImage) {
    return (
      <div className={frame}>
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          width={heroImage.width}
          height={heroImage.height}
          preload
          sizes="(min-width: 1024px) 560px, 100vw"
          className="block h-auto w-full"
        />
      </div>
    );
  }

  // Preview builds only. Never reaches production (see lib/hero.ts).
  return (
    <div
      className={cn(frame, "flex items-center justify-center border-dashed border-ink/40 p-6 text-center")}
      style={{ aspectRatio: HERO_IMAGE_RATIO }}
    >
      <p className="text-sm text-ink/80">
        <span className="block font-bold text-ink">Hero image slot</span>
        4:3, at least 1600×1200
        <br />
        Set it in <code className="font-mono">lib/hero.ts</code>
      </p>
    </div>
  );
}
