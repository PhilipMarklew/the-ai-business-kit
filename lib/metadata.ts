import type { Metadata } from "next";
import { copy } from "@/lib/copy";
import { SHARE_SIZE } from "@/lib/og";
import { site } from "@/lib/site";

/**
 * Builds a page's metadata in one place.
 *
 * Next merges metadata shallowly: a page that sets `openGraph` or `alternates`
 * replaces the layout's object outright. So every page builds the full
 * objects here, or it loses the site name, locale and RSS link (or worse,
 * inherits the home page's share title).
 *
 * Share images come from opengraph-image files (app/ for the site default,
 * app/blog/[slug]/ per post), which Next adds on top of this.
 */

export const FEED_PATH = "/feed.xml";

/** Canonical plus the RSS link. Paths resolve against metadataBase. */
export function alternates(path: string): Metadata["alternates"] {
  return {
    canonical: path,
    types: { "application/rss+xml": [{ url: FEED_PATH, title: `${site.name} guides` }] },
  };
}

const openGraphBase = { siteName: site.name, locale: "en_GB" } as const;

type PageMeta = {
  /** Page name. Gets " | <site name>" added by the root title template. */
  title: string;
  description: string;
  /** Path of this page, like "/blog". */
  path: string;
  /** Use this full <title> instead of the template (the home page). */
  absoluteTitle?: string;
};

/**
 * The site-wide share image (app/opengraph-image.tsx). Named here because a
 * page that sets its own `openGraph` does not inherit the root image file.
 */
const defaultShareImage = {
  url: "/opengraph-image",
  width: SHARE_SIZE.width,
  height: SHARE_SIZE.height,
  alt: `${site.name}: ${copy.shareStrapline}`,
};

export function pageMetadata({ title, description, path, absoluteTitle }: PageMeta): Metadata {
  const shareTitle = absoluteTitle ?? (title === site.name ? title : `${title} | ${site.name}`);
  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: alternates(path),
    openGraph: {
      ...openGraphBase,
      type: "website",
      title: shareTitle,
      description,
      url: path,
      images: [defaultShareImage],
    },
    twitter: { card: "summary_large_image", title: shareTitle, description, images: [defaultShareImage] },
  };
}

type ArticleMeta = {
  /** Headline, used on share cards. */
  title: string;
  /** Shorter <title> text, if the headline is too long for search results. */
  seoTitle: string | null;
  /** Standfirst, used on share cards. */
  description: string;
  /** Meta description, if the standfirst is too long for search results. */
  seoDescription: string | null;
  path: string;
  publishedTime: string;
  modifiedTime: string;
  authors: string[];
};

export function articleMetadata(a: ArticleMeta): Metadata {
  return {
    title: a.seoTitle ?? a.title,
    description: a.seoDescription ?? a.description,
    alternates: alternates(a.path),
    openGraph: {
      ...openGraphBase,
      type: "article",
      title: a.title,
      description: a.description,
      url: a.path,
      publishedTime: a.publishedTime,
      modifiedTime: a.modifiedTime,
      authors: a.authors,
    },
    twitter: { card: "summary_large_image", title: a.title, description: a.description },
  };
}
