import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/page-container";
import { copy } from "@/lib/copy";

export const metadata: Metadata = {
  title: copy.notFound.title,
  alternates: { canonical: null },
  robots: { index: false },
};

const links = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Read the blog" },
  { href: "/newsletter", label: "Newsletter" },
];

export default function NotFound() {
  return (
    <PageContainer>
      <p className="text-sm font-bold text-link">404</p>
      <h1 className="mt-3 text-display font-heading">{copy.notFound.heading}</h1>
      <p className="mt-5 text-lg text-muted">{copy.notFound.body}</p>
      <ul className="mt-8 flex flex-wrap gap-3">
        {links.map((l, i) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={
                i === 0
                  ? "inline-flex h-11 items-center rounded-control bg-accent px-5 font-bold text-on-accent hover:bg-accent-hover hover:text-on-accent"
                  : "inline-flex h-11 items-center rounded-control border border-line px-5 font-semibold text-ink hover:border-muted hover:text-ink"
              }
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
