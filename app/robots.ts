import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * This file is the only source of robots.txt (D-015). Cloudflare's managed
 * robots.txt is switched off, so what is written here is what crawlers get.
 *
 * Search and answer crawlers are allowed. Bot tokens verified on each vendor's
 * own page on 17 Nov 2026:
 * - Googlebot: https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers
 * - Bingbot: https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0
 * - OAI-SearchBot (ChatGPT search): https://developers.openai.com/api/docs/bots
 * - PerplexityBot (search): https://docs.perplexity.ai/guides/bots
 */
const SEARCH_BOTS = ["Googlebot", "Bingbot", "OAI-SearchBot", "PerplexityBot"];

/**
 * Crawlers or opt-out tokens used only for AI model training. Blocked by Phil's
 * choice (D-015). None of these affects search results. Verified 18 Nov 2026:
 * - GPTBot (OpenAI training): https://developers.openai.com/api/docs/bots
 * - ClaudeBot (Anthropic training; Claude-SearchBot and Claude-User stay allowed):
 *   https://support.claude.com/en/articles/8896518
 * - CCBot (Common Crawl): https://commoncrawl.org/ccbot
 * - Google-Extended (Gemini training and grounding; no effect on Google Search):
 *   https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
 * - Applebot-Extended (Apple model training; no effect on Apple search):
 *   https://support.apple.com/en-us/119829
 * Cloudflare also blocks some of these at the edge with a 403 (D-015).
 */
const TRAINING_BOTS = ["GPTBot", "ClaudeBot", "CCBot", "Google-Extended", "Applebot-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: SEARCH_BOTS, allow: "/" },
      { userAgent: TRAINING_BOTS, disallow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
