"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { hasGpc, isOptedOut, UMAMI_BEFORE_SEND, UMAMI_SCRIPT_SRC } from "@/lib/analytics";

const subscribe = () => () => {};
const shouldLoad = () => !isOptedOut() && !hasGpc();

/**
 * Loads the Umami tracker unless the visitor opted out or sends GPC, so those
 * visitors never contact Umami's CDN. Opting out later in the same visit is still
 * honoured: the tracker checks the flag before every send.
 *
 * afterInteractive: a small async file after hydration, so it cannot delay LCP,
 * and it still records quick bounces (lazyOnload would lose them).
 * data-domains limits counting to the live hostname (no localhost or previews).
 */
export function UmamiTracker({ websiteId, domains }: { websiteId: string; domains: string }) {
  const load = useSyncExternalStore(subscribe, shouldLoad, () => false);
  if (!load) return null;
  return (
    <Script
      src={UMAMI_SCRIPT_SRC}
      data-website-id={websiteId}
      data-domains={domains}
      data-do-not-track="true"
      data-exclude-hash="true"
      data-before-send={UMAMI_BEFORE_SEND}
      strategy="afterInteractive"
    />
  );
}
