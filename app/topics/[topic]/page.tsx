import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { breadcrumbs, JsonLd } from "@/components/json-ld";
import { ListingHeader } from "@/components/listing-header";
import { PostList } from "@/components/post-card";
import { SignupBand } from "@/components/signup-band";
import { copy } from "@/lib/copy";
import { pageMetadata } from "@/lib/metadata";
import { getPostsByTopic } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";
import { getTopic, topics } from "@/lib/topics";

export function generateStaticParams() {
  return topics.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/topics/[topic]">): Promise<Metadata> {
  const { topic: slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return {};
  return pageMetadata({ title: topic.name, description: topic.metaDescription, path: `/topics/${topic.slug}` });
}

export default async function TopicPage({ params }: PageProps<"/topics/[topic]">) {
  const { topic: slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();
  const posts = getPostsByTopic(topic.slug);

  return (
    <div className="mx-auto w-full max-w-page px-5 sm:px-8">
      <ListingHeader title={topic.name} intro={topic.summary} current={topic.slug} />
      <div className="border-t border-line pt-10 md:pt-12">
        {posts.length > 0 ? <PostList posts={posts} headingLevel="h2" /> : <p className="text-muted">{copy.topicPage.empty}</p>}
      </div>
      <div className="mt-20">
        <SignupBand />
      </div>
      <JsonLd
        data={breadcrumbs([
          ["Home", absoluteUrl("/")],
          [topic.name, absoluteUrl(`/topics/${topic.slug}`)],
        ])}
      />
    </div>
  );
}
