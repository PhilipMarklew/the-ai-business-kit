import { markImage } from "@/lib/og";

/**
 * /logo.png: a 512px square of the site mark at a fixed URL. Used as the
 * Organization logo in JSON-LD (Google asks for at least 112px and a stable,
 * crawlable URL) and as the large web manifest icon.
 */
export function GET() {
  return markImage(512);
}
