import { ImageResponse } from "next/og";
import { COLOURS, SHARE_SIZE, shareFonts } from "@/lib/og";
import { getPost, postStaticParams } from "@/lib/posts";
import { site } from "@/lib/site";
import { getTopic } from "@/lib/topics";

/**
 * Share image for each post (the preview on X, WhatsApp, iMessage and so on).
 * Built at build time in the dark brand look (colours and fonts: lib/og.tsx).
 */
export const alt = "Post title on The AI Business Kit";
export const size = SHARE_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return postStaticParams();
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? site.name;
  const topic = post ? getTopic(post.topic)?.name : undefined;

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
    { ...SHARE_SIZE, fonts: await shareFonts() },
  );
}
