import Image from "next/image";
import type { Post } from "@/lib/posts";
import type { TopicSlug } from "@/lib/topics";
import { cn } from "@/lib/utils";

/**
 * Motifs stay inside x 85-315 so a square crop (cards on the list view, which
 * keep x 75-325 of the 400-wide canvas) never cuts them off.
 *
 * Generated cover art. Each topic has its own motif, and the slug seeds where
 * it sits, so no two posts look the same and no stock photos are needed.
 * Decorative only: the card or page always carries the title as real text.
 */

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A number in [min, max] picked by the seed and a salt. */
function pick(seed: number, salt: number, min: number, max: number): number {
  const n = hash(`${seed}:${salt}`) / 0xffffffff;
  return Math.round(min + n * (max - min));
}

const W = 400;
const H = 250;

function FoundMotif({ seed }: { seed: number }) {
  const cx = pick(seed, 1, 190, 240);
  const cy = pick(seed, 2, 95, 160);
  const rings = [22, 48, 78, 112, 150, 192];
  return (
    <g>
      {rings.map((r, i) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--link)"
          strokeWidth={i === 0 ? 3 : 1.5}
          opacity={1 - i * 0.15}
        />
      ))}
      <circle cx={cx} cy={cy} r={7} fill="var(--accent)" />
      <line
        x1={cx}
        y1={cy}
        x2={cx - 110}
        y2={cy + pick(seed, 3, -60, 60)}
        stroke="var(--link)"
        strokeWidth={1.5}
        strokeDasharray="4 6"
        opacity={0.7}
      />
    </g>
  );
}

function TrustedMotif({ seed }: { seed: number }) {
  const x = pick(seed, 1, 120, 140);
  const y = pick(seed, 2, 70, 90);
  const s = 120;
  return (
    <g>
      {[2, 1].map((n) => (
        <rect
          key={n}
          x={x + n * 22}
          y={y - n * 14}
          width={s}
          height={s}
          rx={22}
          fill="none"
          stroke="var(--link)"
          strokeWidth={1.5}
          opacity={0.25 + (2 - n) * 0.25}
        />
      ))}
      <rect x={x} y={y} width={s} height={s} rx={22} fill="var(--raised)" stroke="var(--link)" strokeWidth={3} />
      <polyline
        points={`${x + 34},${y + 62} ${x + 54},${y + 82} ${x + 88},${y + 42}`}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function BetterMotif({ seed }: { seed: number }) {
  const steps = 5;
  const baseX = pick(seed, 1, 105, 120);
  const baseY = 215;
  const stepW = 40;
  const rise = pick(seed, 2, 24, 32);
  const bars = Array.from({ length: steps }, (_, i) => ({
    x: baseX + i * stepW,
    h: rise * (i + 1) + pick(seed, 10 + i, -6, 6),
  }));
  const last = bars[bars.length - 1];
  return (
    <g>
      <line x1={0} y1={baseY} x2={W} y2={baseY} stroke="var(--link)" strokeWidth={1.5} opacity={0.5} />
      {bars.map((b, i) => (
        <rect
          key={b.x}
          x={b.x}
          y={baseY - b.h}
          width={stepW - 10}
          height={b.h}
          rx={6}
          fill={i === steps - 1 ? "var(--accent)" : "none"}
          stroke="var(--link)"
          strokeWidth={i === steps - 1 ? 0 : 1.5}
          opacity={i === steps - 1 ? 1 : 0.45 + i * 0.12}
        />
      ))}
      <path
        d={`M ${baseX + 15} ${baseY - bars[0].h - 18} Q ${baseX + 90} ${baseY - 120} ${last.x + 15} ${baseY - last.h - 22}`}
        fill="none"
        stroke="var(--link)"
        strokeWidth={2}
        strokeDasharray="4 6"
      />
    </g>
  );
}

const motifs: Record<TopicSlug, (props: { seed: number }) => React.ReactNode> = {
  "get-found": FoundMotif,
  "get-trusted": TrustedMotif,
  "run-better": BetterMotif,
};

/**
 * A post's cover: its real image when the frontmatter sets one (an annotated
 * screenshot or video still), otherwise the generated motif below.
 */
export function PostCover({
  post,
  className,
  sizes = "(min-width: 1024px) 720px, 100vw",
  preload = false,
}: {
  post: Pick<Post, "slug" | "topic" | "cover">;
  className?: string;
  sizes?: string;
  preload?: boolean;
}) {
  if (post.cover) {
    return (
      <div className={cn("relative overflow-hidden rounded-panel border border-line bg-surface", className ?? "aspect-video")}>
        <Image src={post.cover.src} alt={post.cover.alt} fill sizes={sizes} preload={preload} className="object-cover object-left-top" />
      </div>
    );
  }
  return <MotifCover slug={post.slug} topic={post.topic} className={className} />;
}

function MotifCover({
  slug,
  topic,
  className,
}: {
  slug: string;
  topic: TopicSlug;
  className?: string;
}) {
  const seed = hash(slug);
  const Motif = motifs[topic];
  const patternId = `dots-${slug}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={cn("block h-auto w-full rounded-panel bg-surface", className)}
    >
      <defs>
        <pattern id={patternId} width={20} height={20} patternUnits="userSpaceOnUse">
          <circle cx={2} cy={2} r={1.2} fill="var(--line)" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#${patternId})`} />
      <Motif seed={seed} />
    </svg>
  );
}
