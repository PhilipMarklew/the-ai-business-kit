import { UmamiTracker } from "@/components/umami-tracker";
import { BEFORE_SEND_SCRIPT } from "@/lib/analytics";
import { site } from "@/lib/site";

/**
 * Production only, and only when NEXT_PUBLIC_UMAMI_WEBSITE_ID is set. Server
 * component: it reads SITE_URL, which is server-only.
 *
 * The inline script defines the before-send hook first (GPC check, query-string
 * stripping). components/umami-tracker.tsx then loads the tracker itself, and
 * skips it for visitors who opted out or send Global Privacy Control.
 */
export function AnalyticsScript() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
  if (process.env.NODE_ENV !== "production" || !websiteId) return null;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BEFORE_SEND_SCRIPT }} />
      <UmamiTracker websiteId={websiteId} domains={new URL(site.url).hostname} />
    </>
  );
}
