import type { ReactNode } from "react";

/**
 * Hand-drawn coral marker under a few words. The site's one signature habit:
 * it matches the marker annotations on the post covers, which come from the
 * screen recordings in Phil's videos. Use it once per page at most.
 *
 * The stroke is an SVG path stretched under the text, so it scales with the
 * words and wraps with them. Decorative only (aria-hidden).
 */
export function Marker({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 300 24"
        preserveAspectRatio="none"
        className="absolute -bottom-[0.12em] left-[-2%] z-0 h-[0.32em] w-[104%] overflow-visible"
      >
        <path
          d="M4 15 C 60 9, 140 7, 220 9 C 255 10, 280 12, 296 14"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="9"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M18 20 C 90 16, 170 15, 270 18"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}
