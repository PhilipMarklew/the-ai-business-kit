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
          <span className="rounded-full border border-muted px-2 py-0.5 text-xs font-semibold text-ink">
            Draft
          </span>
        </>
      )}
    </p>
  );
}

function TopicTag({ post }: { post: Post }) {
  const topic = getTopic(post.topic);
  return <p className="text-sm font-semibold text-link">{topic?.name}</p>;
}

/**
 * The lead story. Cover and text side by side from tablet up, stacked on a
 * phone. The whole block is one link; the title carries the accessible name.
 */
export function FeaturedPost({ post, headingLevel = "h2" }: { post: Post; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="group relative grid items-center gap-6 md:grid-cols-[1.15fr_1fr] md:gap-10">
      <div className="overflow-hidden rounded-panel">
        <PostCover
          slug={post.slug}
          topic={post.topic}
          className="transition-transform duration-500 ease-out-quart group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col gap-3">
        <TopicTag post={post} />
        <Heading className="text-headline font-bold">
          <Link
            href={`/blog/${post.slug}`}
            className="text-ink after:absolute after:inset-0 after:content-[''] hover:text-ink group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4"
          >
            {post.title}
          </Link>
        </Heading>
        <p className="text-lg text-muted">{post.description}</p>
        <PostMeta post={post} className="mt-1" />
      </div>
    </article>
  );
}

/** Compact horizontal card for lists: small cover, title, one-line summary, meta. */
export function PostRow({ post }: { post: Post }) {
  return (
    <article className="group relative grid grid-cols-[6.5rem_1fr] items-start gap-4 sm:grid-cols-[9rem_1fr] sm:gap-5">
      <div className="overflow-hidden rounded-panel">
        <PostCover
          slug={post.slug}
          topic={post.topic}
          className="aspect-square transition-transform duration-500 ease-out-quart group-hover:scale-[1.05]"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <TopicTag post={post} />
        <h3 className="text-title font-bold">
          <Link
            href={`/blog/${post.slug}`}
            className="text-ink after:absolute after:inset-0 after:content-[''] hover:text-ink group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4"
          >
            {post.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-muted max-sm:hidden">{post.description}</p>
        <PostMeta post={post} />
      </div>
    </article>
  );
}

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul className="grid gap-x-12 gap-y-10 md:grid-cols-2">
      {posts.map((p) => (
        <li key={p.slug}>
          <PostRow post={p} />
        </li>
      ))}
    </ul>
  );
}
