import { markImage } from "@/lib/og";

/**
 * /favicon.ico, which browsers and some crawlers request without reading any
 * <link> tag. Modern browsers use app/icon.svg instead.
 *
 * An .ico file can hold a PNG as its image data, so this wraps a 48px PNG of
 * the site mark in the 22-byte ICO header. 48px is the size Google asks for
 * (a multiple of 48) in search result favicons.
 */
const SIZE = 48;

export async function GET() {
  const png = Buffer.from(await markImage(SIZE).arrayBuffer());
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(SIZE, 6); // width
  header.writeUInt8(SIZE, 7); // height
  header.writeUInt8(0, 8); // no palette
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14); // image size
  header.writeUInt32LE(22, 18); // image offset
  return new Response(Buffer.concat([header, png]), {
    headers: { "Content-Type": "image/x-icon" },
  });
}
