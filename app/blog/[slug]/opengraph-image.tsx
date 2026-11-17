import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getPost, postStaticParams } from "@/lib/posts";
import { site } from "@/lib/site";
import { getTopic } from "@/lib/topics";

/**
 * Share image for each post (the preview on X, WhatsApp, iMessage and so on).
 * Built at build time in the dark brand look. Colours are the dark-theme
 * tokens from app/globals.css as hex, because the image renderer cannot read
 * CSS variables.
 */
export const alt = "Post title on The AI Business Kit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return postStaticParams();
}

const COLOURS = { canvas: "#100c0c", ink: "#f6f2f2", muted: "#b4acaa", accent: "#f9786a", line: "#352e2d" };

function font(weight: 600 | 800) {
  return readFile(
    path.join(process.cwd(), "node_modules/@fontsource/manrope/files", `manrope-latin-${weight}-normal.woff`),
  );
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? site.name;
  const topic = post ? getTopic(post.topic)?.name : undefined;
  const [semibold, extrabold] = await Promise.all([font(600), font(800)]);

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
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30, fontWeight: 800 }}>
          <div style={{ width: 24, height: 24, background: COLOURS.accent, borderRadius: 4, transform: "rotate(45deg)" }} />
          {site.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {topic && <div style={{ fontSize: 30, fontWeight: 600, color: COLOURS.accent }}>{topic}</div>}
          <div style={{ fontSize: title.length > 60 ? 60 : 72, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em" }}>
            {title}
          </div>
        </div>
        <div style={{ display: "flex", height: 8, width: 160, background: COLOURS.accent, borderRadius: 4 }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Manrope", data: semibold, weight: 600, style: "normal" },
        { name: "Manrope", data: extrabold, weight: 800, style: "normal" },
      ],
    },
  );
}
