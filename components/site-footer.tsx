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

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-bold text-ink">{title}</h2>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line text-sm text-muted">
      <div className="mx-auto grid w-full max-w-page grid-cols-2 gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 flex max-w-xs flex-col gap-3 md:col-span-1">
          <Link href="/" className="text-base text-ink hover:text-ink">
            <Wordmark />
          </Link>
          <p>{copy.footer.tagline}</p>
          <p>
            {copy.footer.builtBy} {authorDisplayName}
          </p>
        </div>
        <Column title="Topics">
          {topics.map((t) => (
            <li key={t.slug}>
              <Link href={`/topics/${t.slug}`} className="text-muted hover:text-ink">
                {t.name}
              </Link>
            </li>
          ))}
        </Column>
        <Column title="Site">
          {siteLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-muted hover:text-ink">
                {l.label}
              </Link>
            </li>
          ))}
        </Column>
        {liveSocial.length > 0 && (
          <Column title="Follow">
            {liveSocial.map((s) => (
              <li key={s.name}>
                <a href={s.url} rel="me noopener" className="text-muted hover:text-ink">
                  {s.name}
                </a>
              </li>
            ))}
          </Column>
        )}
      </div>
    </footer>
  );
}
