import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";
import { site } from "@/lib/site";

const links = [
  { href: "/blog", label: "Blog", hideOnPhone: false },
  { href: "/tools", label: "Tools", hideOnPhone: true },
  { href: "/about", label: "About", hideOnPhone: true },
];

/** Wordmark: the logo mark, then the site name. */
export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-extrabold tracking-tight max-sm:text-[0.95rem] sm:gap-2">
      <LogoMark className="size-6 shrink-0 sm:size-7" />
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
