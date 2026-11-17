import Link from "next/link";
import { topics, type TopicSlug } from "@/lib/topics";
import { cn } from "@/lib/utils";

/**
 * Topic switcher: All posts, then one link per topic. Plain links, not tabs,
 * because each one is a real page with its own URL. Scrolls sideways on a
 * narrow phone rather than wrapping into a ragged block.
 */
export function TopicNav({ current }: { current: TopicSlug | "all" }) {
  const items = [
    { href: "/blog", label: "All posts", key: "all" as const },
    ...topics.map((t) => ({ href: `/topics/${t.slug}`, label: t.name, key: t.slug })),
  ];
  return (
    <nav aria-label="Topics" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-2">
        {items.map((item) => {
          const active = item.key === current;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors",
                  active
                    ? "border-accent bg-accent text-on-accent hover:text-on-accent"
                    : "border-line text-ink hover:border-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
