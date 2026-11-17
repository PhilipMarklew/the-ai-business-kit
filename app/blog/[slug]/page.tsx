import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { PostMeta, PostRow } from "@/components/post-card";
import { PostCover } from "@/components/post-cover";
import { SignupBand } from "@/components/signup-band";
import { copy } from "@/lib/copy";
import { renderMdx } from "@/lib/mdx";
import { getPost, getRelatedPosts, postStaticParams } from "@/lib/posts";
import { authorDisplayName } from "@/lib/site";
import { getTopic } from "@/lib/topics";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return postStaticParams();
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    // Drafts can be visible on a preview build but must never be indexed.
    robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [authorDisplayName],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const topic = getTopic(post.topic);
  const related = getRelatedPosts(post);
  const content = await renderMdx(post.body);

  return (
    <div className="mx-auto w-full max-w-page px-5 sm:px-8">
      {/* Phone: one centred column. Desktop: spacer | 42rem reading column | 14rem contents. */}
      <article className="mx-auto grid max-w-measure gap-x-14 pt-10 md:pt-16 lg:max-w-none lg:grid-cols-[minmax(0,1fr)_minmax(0,42rem)_14rem]">
        <header className="flex flex-col gap-5 lg:col-start-2">
          <Link href={`/topics/${post.topic}`} className="self-start text-sm font-bold">
            {topic?.name}
          </Link>
          <h1 className="animate-rise text-headline font-extrabold md:text-[clamp(2.25rem,1.5rem+2.4vw,3.25rem)]">
            {post.title}
          </h1>
          <p className="text-lg text-muted md:text-xl">{post.description}</p>
          <div className="flex flex-col gap-1 border-y border-line py-4">
            <p className="text-sm font-semibold text-ink">
              {copy.article.byline} <Link href="/about">{authorDisplayName}</Link>
            </p>
            <PostMeta post={post} />
          </div>
        </header>

        {post.cover && (
          <PostCover post={post} preload sizes="(min-width: 1024px) 672px, 100vw" className="mt-8 aspect-video lg:col-start-2" />
        )}

        <div className="prose mt-10 min-w-0 lg:col-start-2">{content}</div>

        {post.headings.length > 1 && (
          <aside aria-labelledby="toc-heading" className={cn("mt-10 max-lg:hidden lg:col-start-3", post.cover ? "lg:row-start-3" : "lg:row-start-2")}>
              <nav className="sticky top-8 flex flex-col gap-3 text-sm">
                <h2 id="toc-heading" className="font-bold text-ink">
                  {copy.article.contents}
                </h2>
                <ol className="flex flex-col gap-2 border-l border-line">
                  {post.headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="-ml-px block border-l border-transparent pl-4 text-muted hover:border-link hover:text-ink">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          )}
      </article>

      <div className="mx-auto mt-16 max-w-measure lg:max-w-none">
        <SignupBand />
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-16 md:mt-20">
          <h2 id="related-heading" className="mb-8 text-headline font-bold">
            {copy.article.related}
          </h2>
          <ul className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <PostRow post={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <ArticleJsonLd post={post} />
    </div>
  );
}
