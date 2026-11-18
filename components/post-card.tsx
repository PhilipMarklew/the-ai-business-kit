import Link from "next/link";
import { PostCover } from "@/components/post-cover";
import { formatDate, type Post } from "@/lib/posts";
import { getTopic } from "@/lib/topics";
import { cn } from "@/lib/utils";

export function PostMeta({ post, className }: { post: Post; className?: string }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 text-sm text-muted", className)}>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden="true">·</span>
      <span>{post.readingMinutes} min read</span>
      {post.draft && (
        <>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-ink">Draft</span>
        </>
      )}
    </p>
  );
}

function TopicTag({ post }: { post: Post }) {
  const topic = getTopic(post.topic);
  return <p className="text-sm font-semibold text-link">{topic?.name}</p>;
}

/** Title link that makes its whole article block clickable. Hover underlines the title only. */
function TitleLink({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="text-ink decoration-2 underline-offset-4 after:absolute after:inset-0 after:content-[''] hover:text-ink group-hover:underline"
    >
      {post.title}
    </Link>
  );
}

/**
 * Lead story for the home page: cover on top, then a large headline. Reads
 * like the top story of a publication, sized well above everything near it.
 */
export function LeadStory({ post }: { post: Post }) {
  return (
    <article className="group relative flex flex-col gap-4">
      <PostCover post={post} className="aspect-video" preload />
      <div className="mt-2 flex flex-col gap-3">
        <TopicTag post={post} />
        <h3 className="text-headline font-heading">
          <TitleLink post={post} />
        </h3>
        <p className="max-w-[56ch] text-lg text-muted">{post.description}</p>
        <PostMeta post={post} />
      </div>
    </article>
  );
}

/** Text-only headline for side lists. No image, so the lead story keeps the weight. */
export function PostHeadline({ post }: { post: Post }) {
  return (
    <article className="group relative flex flex-col gap-1.5 py-5">
      <TopicTag post={post} />
      <h3 className="text-lg font-heading leading-snug">
        <TitleLink post={post} />
      </h3>
      <PostMeta post={post} />
    </article>
  );
}

/**
 * The lead story on /blog: cover and text side by side from tablet up,
 * stacked on a phone.
 */
export function FeaturedPost({ post, headingLevel = "h2" }: { post: Post; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="group relative grid items-center gap-6 md:grid-cols-[1.15fr_1fr] md:gap-10">
      <PostCover post={post} className="aspect-video" />
      <div className="flex flex-col gap-3">
        <TopicTag post={post} />
        <Heading className="text-headline font-heading">
          <TitleLink post={post} />
        </Heading>
        <p className="text-lg text-muted">{post.description}</p>
        <PostMeta post={post} className="mt-1" />
      </div>
    </article>
  );
}

/** Compact horizontal card for lists: small cover, title, one-line summary, meta. */
export function PostRow({ post, headingLevel = "h3" }: { post: Post; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="group relative grid grid-cols-[6.5rem_1fr] items-start gap-4 sm:grid-cols-[9rem_1fr] sm:gap-5">
      <PostCover post={post} className="aspect-square" sizes="144px" />
      <div className="flex min-w-0 flex-col gap-1.5">
        <TopicTag post={post} />
        <Heading className="text-title font-heading">
          <TitleLink post={post} />
        </Heading>
        <p className="line-clamp-2 text-muted max-sm:hidden">{post.description}</p>
        <PostMeta post={post} />
      </div>
    </article>
  );
}

/** `headingLevel` keeps the outline in order: h2 when the list sits straight under the page h1. */
export function PostList({ posts, headingLevel }: { posts: Post[]; headingLevel?: "h2" | "h3" }) {
  return (
    <ul className="grid gap-x-12 gap-y-10 md:grid-cols-2">
      {posts.map((p) => (
        <li key={p.slug}>
          <PostRow post={p} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
