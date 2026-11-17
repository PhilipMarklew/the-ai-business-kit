import type { Metadata } from "next";
import { PageContainer } from "@/components/page-container";
import { copy } from "@/lib/copy";
import { author, authorDisplayName } from "@/lib/site";

export const metadata: Metadata = {
  title: copy.about.title,
  description: copy.about.description,
};

export default function AboutPage() {
  return (
    <PageContainer>
      <h1 className="text-display font-semibold">{copy.about.heading}</h1>
      <p className="mt-5">{copy.about.body}</p>
      <section aria-labelledby="about-author" className="mt-12">
        <h2 id="about-author" className="text-xl font-semibold tracking-tight">
          {authorDisplayName}
        </h2>
        <p className="text-sm text-muted">{author.role}</p>
        <p className="mt-3">{copy.about.authorBio}</p>
      </section>
    </PageContainer>
  );
}
