import type { Metadata } from "next";
import { PageContainer } from "@/components/page-container";
import { SignupForm } from "@/components/signup-form";
import { copy } from "@/lib/copy";

export const metadata: Metadata = {
  title: copy.newsletter.title,
  description: copy.newsletter.description,
};

export default function NewsletterPage() {
  return (
    <PageContainer>
      <h1 className="text-display font-semibold">{copy.newsletter.heading}</h1>
      <ul className="mt-5 space-y-1">
        {copy.newsletter.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div className="mt-8">
        <SignupForm />
      </div>
    </PageContainer>
  );
}
