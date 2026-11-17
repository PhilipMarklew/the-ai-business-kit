import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Bot tokens verified on each vendor's own page on 17 Nov 2026:
 * - Googlebot: https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers
 * - Bingbot: https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0
 * - OAI-SearchBot (OpenAI search, separate from GPTBot training): https://platform.openai.com/docs/bots
 * - PerplexityBot (search, not model training): https://docs.perplexity.ai/guides/bots
 * Named groups are explicit so the intent is on record. No blanket disallow.
 */
const SEARCH_BOTS = ["Googlebot", "Bingbot", "OAI-SearchBot", "PerplexityBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: SEARCH_BOTS, allow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
