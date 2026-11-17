/**
 * Image for the home hero's right-hand side.
 *
 * TODO(phil): to add one, put the file in public/images/ and fill in `heroImage`.
 * Best fit: a 4:3 screenshot or video still, at least 1600x1200, PNG or JPG.
 * next/image resizes and converts it, so the source can be large.
 * The hero crops the image's right side (it bleeds off the edge), so put
 * whatever matters in the top-left of the image.
 *
 *   export const heroImage: HeroImage | null = {
 *     src: "/images/hero.png",
 *     alt: "ChatGPT answering a question about a local bakery",
 *   };
 *
 * While it is null, preview builds (dev, or SHOW_DRAFTS=true) show a labelled
 * placeholder frame so the layout can be judged. Production shows nothing and
 * the hero falls back to text only.
 */
export type HeroImage = { src: string; alt: string };

export const heroImage: HeroImage | null = null;

export const showHeroPlaceholder =
  process.env.SHOW_DRAFTS === "true" || process.env.NODE_ENV === "development";
