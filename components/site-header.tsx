import Link from "next/link";
import { site } from "@/lib/site";

const links = [
  { href: "/about", label: "About" },
  { href: "/newsletter", label: "Newsletter" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex w-full max-w-page items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="font-semibold tracking-tight text-ink hover:text-ink">
          {site.name}
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-5 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
