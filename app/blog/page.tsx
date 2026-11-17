import type { Metadata } from "next";
import { ListingHeader } from "@/components/listing-header";
import { FeaturedPost, PostList } from "@/components/post-card";
import { SignupBand } from "@/components/signup-band";
import { copy } from "@/lib/copy";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: copy.blog.title,
  description: copy.blog.description,
};

export default function BlogPage() {
  const [featured, ...rest] = getPosts();
  return (
    <div className="mx-auto w-full max-w-page px-5 sm:px-8">
      <ListingHeader title={copy.blog.heading} intro={copy.blog.intro} current="all" />
      {featured ? (
        <div className="flex flex-col gap-16 border-t border-line pt-10 md:pt-12">
          <FeaturedPost post={featured} />
          {rest.length > 0 && (
            <section aria-label="More posts">
              <PostList posts={rest} />
            </section>
          )}
        </div>
      ) : (
        <p className="border-t border-line pt-10 text-muted">{copy.blog.empty}</p>
      )}
      <div className="mt-20">
        <SignupBand />
      </div>
    </div>
  );
}
