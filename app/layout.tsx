import type { Metadata, Viewport } from "next";
import { Literata, Schibsted_Grotesk } from "next/font/google";
import { OrganizationJsonLd } from "@/components/organization-json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { copy } from "@/lib/copy";
import { site } from "@/lib/site";
import "./globals.css";

// Self-hosted at build time by next/font, with a size-matched fallback so the
// swap causes no layout shift. Variable font: one file covers every weight.
const brandFont = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-brand",
});

// Headings only. Weight and tracking live in app/globals.css (--heading-*).
// Also trialled 17 Nov 2026: Hedvig_Letters_Serif and Young_Serif (both single
// weight: pass weight: "400" here and set --heading-weight: 400 in globals.css).
const headingFont = Literata({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading-face",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: copy.siteDescription,
  // Resolved per page against metadataBase, so every page gets its own canonical.
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_GB",
    title: site.name,
    description: copy.siteDescription,
    url: "./",
  },
  twitter: { card: "summary", title: site.name, description: copy.siteDescription },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffdfd" },
    { media: "(prefers-color-scheme: dark)", color: "#100c0c" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${brandFont.variable} ${headingFont.variable} h-full antialiased`}>
      <body className="backdrop-both flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-control focus:bg-accent focus:px-3 focus:py-2 focus:font-semibold focus:text-on-accent"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <OrganizationJsonLd />
      </body>
    </html>
  );
}
