/**
 * Single source for site identity. Server-only: SITE_NAME and SITE_URL are
 * not NEXT_PUBLIC_, so every consumer must render on the server (spec D-004).
 * Pages bake the values in at build time; change the variable and redeploy.
 */

function readSiteUrl(): string {
  const raw = process.env.SITE_URL?.trim();
  if (!raw) {
    throw new Error(
      "SITE_URL is not set. Set it to the full site origin with no trailing slash, " +
        "for example https://theaibusinesskit.com (see .env.example).",
    );
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`SITE_URL is not a valid URL: "${raw}".`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`SITE_URL must start with http:// or https://, got "${raw}".`);
  }
  return url.origin;
}

export const site: { name: string; url: string } = {
  name: process.env.SITE_NAME?.trim() || "The AI Business Kit",
  url: readSiteUrl(),
};

/**
 * The named author. Used by the About page, the footer and the Organization
 * JSON-LD, so the three always match. Site copy speaks as the brand, so Phil
 * appears by name only as author, email sender and privacy controller.
 * TODO(copy): Phil confirms surname and whether to show it. Margot writes the bio.
 */
export const author = {
  name: "Phil",
  surname: null as string | null, // TODO(copy): surname, if Phil wants it shown
  role: "Founder", // TODO(copy)
} as const;

export const authorDisplayName = author.surname
  ? `${author.name} ${author.surname}`
  : author.name;

/** Absolute URL for a path on this site. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}
