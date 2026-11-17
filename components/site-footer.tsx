import Link from "next/link";
import { copy } from "@/lib/copy";
import { authorDisplayName, site } from "@/lib/site";

const links = [
  { href: "/about", label: "About" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line text-sm text-muted">
      <div className="mx-auto flex w-full max-w-page flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <p>
            <span className="font-medium text-ink">{site.name}</span>
          </p>
          <p>
            {copy.footer.builtBy} {authorDisplayName}
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex gap-5">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
