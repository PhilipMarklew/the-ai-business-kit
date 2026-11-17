import Link from "next/link";
import { Wordmark } from "@/components/site-header";
import { copy } from "@/lib/copy";
import { authorDisplayName } from "@/lib/site";
import { liveSocial } from "@/lib/social";
import { topics } from "@/lib/topics";

const siteLinks = [
  { href: "/blog", label: "All posts" },
  { href: "/tools", label: "Free tools" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
];

/**
 * Two short rows instead of a column grid: a small site does not need a
 * footer the size of a corporate one. Row one: wordmark and tagline. Row two:
 * every link inline, topics first, then site pages, then social.
 */
export function SiteFooter() {
  const links = [
    ...topics.map((t) => ({ href: `/topics/${t.slug}`, label: t.name, external: false })),
    ...siteLinks.map((l) => ({ ...l, external: false })),
    ...liveSocial.map((s) => ({ href: s.url, label: s.name, external: true })),
  ];
  return (
    <footer className="mt-24 border-t border-line text-sm text-muted md:mt-32">
      <div className="mx-auto flex w-full max-w-page flex-col gap-6 px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between md:gap-10">
          <Link href="/" className="text-base text-ink hover:text-ink">
            <Wordmark />
          </Link>
          <p className="max-w-[60ch] md:text-right">{copy.footer.tagline}</p>
        </div>
        <nav aria-label="Footer" className="border-t border-line pt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {links.map((l) => (
              <li key={l.href}>
                {l.external ? (
                  <a href={l.href} rel="me noopener" className="text-muted hover:text-ink">
                    {l.label}
                  </a>
                ) : (
                  <Link href={l.href} className="text-muted hover:text-ink">
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
            <li className="md:ml-auto">
              {copy.footer.builtBy} {authorDisplayName}
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
