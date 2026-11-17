import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/page-container";
import { copy } from "@/lib/copy";

export const metadata: Metadata = {
  title: copy.notFound.title,
  alternates: { canonical: null },
  robots: { index: false },
};

export default function NotFound() {
  return (
    <PageContainer>
      <h1 className="text-display font-semibold">{copy.notFound.heading}</h1>
      <p className="mt-5">{copy.notFound.body}</p>
      <p className="mt-5 flex gap-5">
        <Link href="/">Home</Link>
        <Link href="/newsletter">Newsletter</Link>
      </p>
    </PageContainer>
  );
}
