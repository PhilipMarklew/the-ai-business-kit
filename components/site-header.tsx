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
    <span className="inline-flex items-center gap-2 whitespace-nowrap font-extrabold tracking-tight max-sm:text-[0.95rem] sm:gap-2.5">
      <span aria-hidden="true" className="size-3 shrink-0 rotate-45 rounded-[0.2rem] bg-accent sm:size-3.5" />
      <span>{site.name}</span>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex w-full max-w-page items-center justify-between gap-2 px-4 py-3.5 sm:gap-3 sm:px-8">
        <Link href="/" className="text-ink hover:text-ink">
          <Wordmark />
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-1 text-sm font-semibold sm:gap-2">
            {links.map((l) => (
              <li key={l.href} className={l.hideOnPhone ? "max-sm:hidden" : undefined}>
                <Link
                  href={l.href}
                  className="inline-flex h-10 items-center rounded-control px-2 text-ink hover:bg-surface hover:text-ink sm:px-2.5"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="max-[380px]:hidden">
              <Link
                href="/newsletter"
                className="ml-1 inline-flex h-10 items-center rounded-control bg-accent px-3 text-on-accent sm:px-4 transition-colors hover:bg-accent-hover hover:text-on-accent"
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
