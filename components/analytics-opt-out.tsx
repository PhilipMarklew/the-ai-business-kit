"use client";

import { useState, useSyncExternalStore } from "react";
import { isOptedOut, OPT_OUT_CHANGE, setOptedOut } from "@/lib/analytics";
import { copy } from "@/lib/copy";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(OPT_OUT_CHANGE, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(OPT_OUT_CHANGE, onChange);
  };
}

type Snapshot = "unknown" | "counting" | "stopped";
const getSnapshot = (): Snapshot => (isOptedOut() ? "stopped" : "counting");
// The server cannot read localStorage, so the first render matches it, then React
// swaps in the real value with no hydration mismatch.
const getServerSnapshot = (): Snapshot => "unknown";

/**
 * Opt-out toggle for the privacy page. The button always names the action that
 * is available now. The result is announced in a live region, which is always
 * in the DOM so screen readers pick the change up.
 */
export function AnalyticsOptOut() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [announce, setAnnounce] = useState<"stopped" | "counting" | null>(null);
  const o = copy.privacy.optOut;
  const stopped = state === "stopped";

  function toggle() {
    const next = !stopped;
    if (setOptedOut(next)) setAnnounce(next ? "stopped" : "counting");
  }

  return (
    <section id="opt-out" aria-labelledby="opt-out-heading" className="mt-12 scroll-mt-6 border-t border-line pt-8">
      <h2 id="opt-out-heading" className="text-title font-heading">
        {o.heading}
      </h2>
      <p className="mt-3 text-muted">{o.explanation}</p>
      <button
        type="button"
        onClick={toggle}
        disabled={state === "unknown"}
        className="mt-5 inline-flex h-12 items-center rounded-control border border-muted px-6 text-base font-bold text-ink transition-colors hover:border-ink hover:bg-surface disabled:opacity-60"
      >
        {stopped ? o.countAgain : o.stopCounting}
      </button>
      <p aria-live="polite" className="mt-3 min-h-[1.75em] font-semibold">
        {announce === "stopped" ? o.confirmStopped : announce === "counting" ? o.confirmCounting : ""}
      </p>
      <p className="mt-1 text-sm text-muted">{o.browserNote}</p>
    </section>
  );
}
