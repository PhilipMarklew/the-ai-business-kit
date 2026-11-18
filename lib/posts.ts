import "server-only";
import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import matter from "gray-matter";
import { isTopicSlug, type TopicSlug } from "@/lib/topics";

/**
 * Blog posts are MDX files in content/posts/<slug>.mdx with YAML frontmatter:
 *
 *   ---
 *   title: "..."
 *   description: "..."      # one or two sentences, used for cards and meta
 *   seoTitle: "..."         # optional; shorter <title> (max 43 chars, the site name is added)
 *   seoDescription: "..."   # optional; meta description when `description` is over 155 chars
 *   topic: get-found        # get-found | get-trusted | run-better
 *   date: 2026-11-17        # publish date, YYYY-MM-DD
 *   updated: 2026-11-20     # optional
 *   draft: true             # optional; drafts are hidden in production
 *   cover: /images/posts/x.png   # optional; 16:9 screenshot or video still
 *   coverAlt: "..."              # required when cover is set
 *   ---
 *
 * Without a cover, the post gets a generated motif (components/post-cover.tsx).
 *
 * Drafts show in `next dev`, or anywhere SHOW_DRAFTS=true. They never appear in
 * the sitemap and are always noindex. Reads happen at build time only.
 */

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const WORDS_PER_MINUTE = 230;

export type Heading = { id: string; text: string };

export type Post = {
  slug: string;
  title: string;
  description: string;
  /** Shorter <title> text, when the headline is too long for search results. */
  seoTitle: string | null;
  /** Meta description, when `description` is too long for search results. */
  seoDescription: string | null;
  topic: TopicSlug;
  date: string;
  updated: string | null;
  draft: boolean;
  /** Optional 16:9 cover image under public/, with its alt text. */
  cover: { src: string; alt: string } | null;
  readingMinutes: number;
  /** The h2 headings, in order, with the ids rehype-slug gives them. */
  headings: Heading[];
  /** Raw MDX body without frontmatter. */
  body: string;
};

const showDrafts =
  process.env.SHOW_DRAFTS === "true" || process.env.NODE_ENV === "development";

const DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/;

function fail(file: string, message: string): never {
  throw new Error(`content/posts/${file}: ${message}`);
}

function readDate(file: string, value: unknown, field: string): string {
  // gray-matter parses bare YAML dates into Date objects.
  const iso = value instanceof Date ? value.toISOString().slice(0, 10) : value;
  if (typeof iso !== "string" || !DATE_SHAPE.test(iso)) {
    fail(file, `"${field}" must be a date like 2026-11-17.`);
  }
  return iso;
}

function readCover(file: string, data: Record<string, unknown>): Post["cover"] {
  if (data.cover == null) return null;
  const src = data.cover;
  if (typeof src !== "string" || !src.startsWith("/images/")) {
    fail(file, `"cover" must be a path under public/images/, like /images/posts/my-post.png.`);
  }
  if (!fs.existsSync(path.join(process.cwd(), "public", src))) fail(file, `cover file public${src} does not exist.`);
  return { src, alt: readString(file, data, "coverAlt") };
}

function readString(file: string, data: Record<string, unknown>, field: string): string {
  const value = data[field];
  if (typeof value !== "string" || !value.trim()) fail(file, `"${field}" is missing.`);
  return value.trim();
}

function readOptionalString(file: string, data: Record<string, unknown>, field: string): string | null {
  if (data[field] == null) return null;
  return readString(file, data, field);
}

/** h2 headings from the markdown source, slugged the same way rehype-slug does it. */
function extractHeadings(body: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (line.trimStart().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    // rehype-slug slugs every heading level in document order, so h3s must
    // advance the slugger too, or duplicate-text ids drift out of step.
    const match = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[*_`]/g, "");
    const id = slugger.slug(text);
    if (match[1].length === 2) headings.push({ id, text });
  }
  return headings;
}

function readingMinutes(body: string): number {
  const words = body.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function loadPost(file: string): Post {
  const slug = file.replace(/\.mdx$/, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail(file, "file name must be lowercase words joined by hyphens.");
  }
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const topic = data.topic;
  if (!isTopicSlug(topic)) fail(file, `"topic" must be get-found, get-trusted or run-better.`);
  return {
    slug,
    title: readString(file, data, "title"),
    description: readString(file, data, "description"),
    seoTitle: readOptionalString(file, data, "seoTitle"),
    seoDescription: readOptionalString(file, data, "seoDescription"),
    topic,
    date: readDate(file, data.date, "date"),
    updated: data.updated == null ? null : readDate(file, data.updated, "updated"),
    draft: data.draft === true,
    cover: readCover(file, data),
    readingMinutes: readingMinutes(content),
    headings: extractHeadings(content),
    body: content,
  };
}

let cache: Post[] | null = null;

/** Every post on disk, newest first, drafts included. */
function loadAll(): Post[] {
  // Cache only in production builds. In `next dev` the module outlives edits,
  // so a cache would hide every change to a post until the server restarts.
  if (cache && process.env.NODE_ENV === "production") return cache;
  const files = fs.existsSync(POSTS_DIR)
    ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"))
    : [];
  cache = files.map(loadPost).sort((a, b) => b.date.localeCompare(a.date));
  return cache;
}

/** Posts visible in this environment, newest first. */
export function getPosts(): Post[] {
  return loadAll().filter((p) => showDrafts || !p.draft);
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}

export function getPostsByTopic(topic: TopicSlug): Post[] {
  return getPosts().filter((p) => p.topic === topic);
}

/** Posts for the sitemap: published only, whatever the environment. */
export function getPublishedPosts(): Post[] {
  return loadAll().filter((p) => !p.draft);
}

/** Up to `limit` other posts, same topic first, then the newest of the rest. */
export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const others = getPosts().filter((p) => p.slug !== post.slug);
  const sameTopic = others.filter((p) => p.topic === post.topic);
  const rest = others.filter((p) => p.topic !== post.topic);
  return [...sameTopic, ...rest].slice(0, limit);
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "17 November 2026". */
export function formatDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`));
}

/**
 * Params for generateStaticParams on /blog/[slug]. Cache Components requires at
 * least one entry, so with no visible posts (a production build before the
 * first post is published) this returns one placeholder slug. getPost() never
 * finds it, so that path renders the 404 page.
 */
export function postStaticParams(): { slug: string }[] {
  const posts = getPosts();
  return posts.length > 0 ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "no-posts-yet" }];
}
