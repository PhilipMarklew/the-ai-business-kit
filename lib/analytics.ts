/**
 * Analytics. The ONLY file that knows about Umami Cloud. Everything else calls
 * track() or reads the constants below, so swapping the tool later touches one file.
 *
 * Cookieless: Umami sets no cookies. Page views are automatic (the tracker script
 * is loaded by components/analytics-script.tsx). Only custom events go through here.
 *
 * Privacy rules for payloads: small, closed shapes. Never an email, a name, free
 * text a visitor typed, or anything else that identifies a person.
 *
 * Adding a tool event: inside a tool's client component, call
 *   track("tool_run", { tool: "<slug>" })
 * with the same slug as the tool's registry entry (lib/tools.ts). Add a new event
 * name to AnalyticsEventMap below if a tool needs something else.
 *
 * Opt-out: Umami's documented disable flag is localStorage "umami.disabled" = "1"
 * (the tracker checks it before every send; confirmed in cloud.umami.is/script.js
 * 18 Nov 2026). The privacy page toggle uses the helpers below. The copy in
 * lib/copy.ts (privacy.optOut) says the choice is saved in this browser only.
 */

/*
 * Never use data-distinct-id, umami.identify(), data-errors or Umami's session recorder:
 * they link visits to a person or capture user input, which breaks the privacy notice.
 */

export const UMAMI_BEFORE_SEND = "umamiBeforeSend";

/**
 * Source of the before-send hook, rendered as an inline script BEFORE the tracker
 * (components/analytics-script.tsx) and wired with data-before-send. It cancels the
 * send when the browser sends Global Privacy Control, and strips query strings from
 * the page URL and same-site referrer, keeping only utm_* campaign tags.
 * Plain ES5 on purpose: it runs as a string, outside the bundler.
 */
export const BEFORE_SEND_SCRIPT = `window.${UMAMI_BEFORE_SEND}=function(t,p){try{
if(navigator.globalPrivacyControl===true)return null;
var clean=function(u){if(!u)return u;var x=new URL(u,location.href);if(x.origin!==location.origin)return u;
var k=new URLSearchParams();x.searchParams.forEach(function(v,n){if(n.indexOf("utm_")===0)k.append(n,v)});
var q=k.toString();var out=x.pathname+(q?"?"+q:"");return u.charAt(0)==="/"?out:x.origin+out};
if(p){p.url=clean(p.url);p.referrer=clean(p.referrer)}}catch(e){}return p};`;

/** True when the browser sends Global Privacy Control. */
export function hasGpc(): boolean {
  return typeof navigator !== "undefined" && (navigator as { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

export const UMAMI_SCRIPT_SRC = "https://cloud.umami.is/script.js";
export const OPT_OUT_KEY = "umami.disabled";

/** Where a signup form sits. Lets us see which placement earns signups. */
export type SignupPlacement = "band" | "home_aside" | "newsletter_page" | "tool_page";

/** Closed list of events and the payload each one carries. */
export type AnalyticsEventMap = {
  signup: { placement: SignupPlacement; tool?: string };
  signup_error: { error: string };
  follow_click: { network: string; placement: "follow_links" | "footer" };
  tool_run: { tool: string };
};

export type AnalyticsEvent = keyof AnalyticsEventMap;

type UmamiTracker = {
  track: (name: string, data?: Record<string, string | number | boolean>) => void;
};

function umami(): UmamiTracker | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { umami?: UmamiTracker }).umami;
}

/** True when this browser has opted out. Storage can throw (blocked, private mode). */
export function isOptedOut(): boolean {
  try {
    return window.localStorage.getItem(OPT_OUT_KEY) !== null;
  } catch {
    return false;
  }
}

/** Returns false when the browser would not let us save the choice. */
export function setOptedOut(value: boolean): boolean {
  try {
    if (value) window.localStorage.setItem(OPT_OUT_KEY, "1");
    else window.localStorage.removeItem(OPT_OUT_KEY);
    window.dispatchEvent(new Event(OPT_OUT_CHANGE));
    return true;
  } catch {
    return false;
  }
}

/** Fired on the same tab after setOptedOut, so the toggle stays in step. */
export const OPT_OUT_CHANGE = "analytics:optout-change";

/**
 * Send a custom event. Does nothing on the server, when the tracker is not
 * loaded (dev, previews, no website ID, blocked by the browser) or when the
 * visitor has opted out. Never throws.
 */
export function track<E extends AnalyticsEvent>(event: E, data?: AnalyticsEventMap[E]): void {
  try {
    const tracker = umami();
    if (!tracker || isOptedOut()) return;
    tracker.track(event, data);
  } catch {
    // Analytics must never break the page.
  }
}
