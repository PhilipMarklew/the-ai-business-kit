import { TopicNav } from "@/components/topic-nav";
import type { TopicSlug } from "@/lib/topics";

/** Shared top of /blog and /topics/<slug>: title, one line, topic switcher. */
export function ListingHeader({
  title,
  intro,
  current,
}: {
  title: string;
  intro: string;
  current: TopicSlug | "all";
}) {
  return (
    <header className="flex flex-col gap-8 pb-10 pt-12 md:pt-20">
      <div className="flex flex-col gap-4">
        <h1 className="text-display font-extrabold">{title}</h1>
        <p className="max-w-[52ch] text-lg text-muted">{intro}</p>
      </div>
      <TopicNav current={current} />
    </header>
  );
}
