import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/**
 * Shared pieces for generated images: share cards, icons and the logo.
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

/** The site mark: a coral diamond on the dark canvas, as a square PNG. */
export function markImage(size: number): ImageResponse {
  const diamond = Math.round(size * 0.42);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: COLOURS.canvas,
        }}
      >
        <div
          style={{
            width: diamond,
            height: diamond,
            background: COLOURS.accent,
            borderRadius: Math.round(diamond * 0.16),
            transform: "rotate(45deg)",
          }}
        />
      </div>
    ),
    { width: size, height: size },
  );
}
