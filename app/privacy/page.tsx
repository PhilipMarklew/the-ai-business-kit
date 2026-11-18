import type { Metadata } from "next";
import { PageContainer } from "@/components/page-container";
import { copy } from "@/lib/copy";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: copy.privacy.title,
  description: copy.privacy.description,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <PageContainer>
      <h1 className="text-display font-heading">{copy.privacy.heading}</h1>
      <p className="mt-6 whitespace-pre-line leading-relaxed">{copy.privacy.body}</p>
    </PageContainer>
  );
}
