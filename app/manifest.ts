import type { MetadataRoute } from "next";
import { copy } from "@/lib/copy";
import { COLOURS } from "@/lib/og";
import { site } from "@/lib/site";

/** Web app manifest: name and icons for "Add to home screen". Next links it. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: copy.siteDescription,
    start_url: "/",
    display: "browser",
    background_color: COLOURS.canvas,
    theme_color: COLOURS.canvas,
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
  };
}
