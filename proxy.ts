import { NextResponse, type NextRequest } from "next/server";
import { getPost } from "@/lib/posts";
import { getTopic } from "@/lib/topics";

/**
 * Returns a real 404 status for unknown post and topic slugs.
 *
 * With Cache Components, a page sends its prerendered shell (status 200)
 * before `notFound()` in the page body runs. Visitors still see the 404 page
 * with a noindex tag, but crawlers get a 200 and report a "soft 404". Proxy
 * runs before the response starts, so the status here is the one sent.
 * See node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md#status-codes
 *
 * The rewrite target has no route, so Next renders app/not-found.tsx with 404.
 */
const NOT_FOUND_PATH = "/_unknown";

export function proxy(request: NextRequest) {
  const [, section, slug] = request.nextUrl.pathname.split("/");
  const known = section === "blog" ? getPost(slug) : getTopic(slug);
  if (known) return NextResponse.next();
  return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url), { status: 404 });
}

export const config = {
  // Post share images too, so a made-up slug gets no image either.
  matcher: ["/blog/:slug", "/blog/:slug/opengraph-image", "/topics/:slug"],
};
