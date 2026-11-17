import Link from "next/link";
import { site } from "@/lib/site";

const links = [
  { href: "/blog", label: "Blog", hideOnPhone: false },
  { href: "/tools", label: "Tools", hideOnPhone: true },
  { href: "/about", label: "About", hideOnPhone: true },
];

/** Wordmark: the site name, with a coral block as the only mark. */
export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap font-extrabold tracking-tight">
      <span aria-hidden="true" className="size-3.5 rotate-45 rounded-[0.2rem] bg-accent" />
      <span>{site.name}</span>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex w-full max-w-page items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
        <Link href="/" className="text-ink hover:text-ink">
          <Wordmark />
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-1 text-sm font-semibold sm:gap-2">
            {links.map((l) => (
              <li key={l.href} className={l.hideOnPhone ? "max-sm:hidden" : undefined}>
                <Link
                  href={l.href}
                  className="inline-flex h-10 items-center rounded-control px-2.5 text-ink hover:bg-surface hover:text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="max-[380px]:hidden">
              <Link
                href="/newsletter"
                className="ml-1 inline-flex h-10 items-center rounded-control bg-accent px-4 text-on-accent transition-colors hover:bg-accent-hover hover:text-on-accent"
              >
                Subscribe
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
