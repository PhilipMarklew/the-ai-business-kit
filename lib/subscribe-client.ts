/**
 * Client for POST /api/subscribe, typed exactly to the contract in
 * docs/specs/S00-1-architecture.md (owner: Tomas).
 */
export type SubscribeError =
  | "invalid_email"
  | "consent_required"
  | "rate_limited"
  | "provider_unavailable";

export type SubscribeResult =
  | { ok: true }
  | { ok: false; error: SubscribeError | "network" };

const KNOWN: SubscribeError[] = [
  "invalid_email",
  "consent_required",
  "rate_limited",
  "provider_unavailable",
];

export async function postSubscribe(body: {
  email: string;
  consent: true;
  website: string;
}): Promise<SubscribeResult> {
  let res: Response;
  try {
    res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, error: "network" };
  }
  const data: unknown = await res.json().catch(() => null);
  if (res.ok && data && (data as { ok?: unknown }).ok === true) return { ok: true };
  const err = (data as { error?: unknown } | null)?.error;
  if (typeof err === "string" && (KNOWN as string[]).includes(err)) {
    return { ok: false, error: err as SubscribeError };
  }
  return { ok: false, error: "provider_unavailable" };
}
