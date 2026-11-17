import type { Metadata } from "next";
import { PageContainer } from "@/components/page-container";
import { copy } from "@/lib/copy";

export const metadata: Metadata = {
  title: copy.privacy.title,
  description: copy.privacy.description,
};

export default function PrivacyPage() {
  return (
    <PageContainer>
      <h1 className="text-display font-semibold">{copy.privacy.heading}</h1>
      <p className="mt-5 whitespace-pre-line">{copy.privacy.body}</p>
    </PageContainer>
  );
}
