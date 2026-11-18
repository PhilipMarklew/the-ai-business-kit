import { readFile } from "node:fs/promises";
import path from "node:path";
import { MARK_OUTLINE_PATH, MARK_STAR_PATH } from "@/components/logo-mark";

/**
 * Shared pieces for generated share images. The favicon, app icons and
 * the search-data logo are static files from Phil's artwork (see app/ and public/).
 * Colours are the dark-theme tokens from app/globals.css as hex, because the
 * image renderer cannot read CSS variables.
 */
export const COLOURS = {
  canvas: "#100c0c",
  ink: "#f6f2f2",
  muted: "#b4acaa",
  accent: "#f9786a",
  line: "#352e2d",
} as const;

export const SHARE_SIZE = { width: 1200, height: 630 };

/** Manrope from @fontsource, read at build time for ImageResponse. */
export async function shareFonts() {
  const read = (weight: 600 | 800) =>
    readFile(path.join(process.cwd(), "node_modules/@fontsource/manrope/files", `manrope-latin-${weight}-normal.woff`));
  const [semibold, extrabold] = await Promise.all([read(600), read(800)]);
  return [
    { name: "Manrope", data: semibold, weight: 600 as const, style: "normal" as const },
    { name: "Manrope", data: extrabold, weight: 800 as const, style: "normal" as const },
  ];
}

/**
 * The logo mark as an <img> source for share images, in the dark-theme
 * colours. The image renderer draws SVG through <img>, so this is a data URI.
 */
export const MARK_SRC = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="${MARK_STAR_PATH}" fill="${COLOURS.accent}"/><path d="${MARK_OUTLINE_PATH}" fill="${COLOURS.ink}"/></svg>`,
)}`;
