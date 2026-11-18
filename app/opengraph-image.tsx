import { ImageResponse } from "next/og";
import { copy } from "@/lib/copy";
import { COLOURS, MARK_SRC, SHARE_SIZE, shareFonts } from "@/lib/og";
import { site } from "@/lib/site";

/**
 * Default share image for every page without its own (posts have theirs in
 * app/blog/[slug]/). Built at build time in the dark brand look. Pages
 * reference it through pageMetadata() in lib/metadata.ts.
 */
export const alt = `${site.name}: ${copy.shareStrapline}`;
export const size = SHARE_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: COLOURS.canvas,
          color: COLOURS.ink,
          fontFamily: "Manrope",
        }}
      >
        <img src={MARK_SRC} width={72} height={72} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.035em" }}>{site.name}</div>
          <div style={{ fontSize: 40, fontWeight: 600, lineHeight: 1.25, color: COLOURS.muted, maxWidth: 760 }}>
            {copy.shareStrapline}
          </div>
        </div>
        <div style={{ display: "flex", height: 8, width: 160, background: COLOURS.accent, borderRadius: 4 }} />
      </div>
    ),
    { ...SHARE_SIZE, fonts: await shareFonts() },
  );
}
