/**
 * Kit (formerly ConvertKit) API v4 client for newsletter signup. Server-only:
 * reads KIT_API_KEY, which must never reach client code. Import from route
 * handlers only.
 *
 * Docs, read 2026-11-18:
 *  - https://developers.kit.com/api-reference/subscribers/create-a-subscriber
 *  - https://developers.kit.com/api-reference/tags/create-a-tag
 *  - https://developers.kit.com/api-reference/tags/tag-a-subscriber-by-email-address
 *  - https://developers.kit.com/api-reference/forms/add-subscriber-to-form
 *
 * Every call is idempotent, so a retry by the visitor is safe.
 */
const BASE = "https://api.kit.com/v4";
const TIMEOUT_MS = 5000;

export type KitResult = { ok: true } | { ok: false; reason: "config" | "invalid_email" | "upstream" };

class KitError extends Error {
  constructor(
    readonly step: string,
    readonly status: number,
  ) {
    super(`Kit ${step} failed with status ${status}`);
  }
}

// Tag ids are stable; look each name up once per process.
const tagIds = new Map<string, number>();

async function kit(
  step: string,
  path: string,
  body: unknown,
  signal: AbortSignal,
  apiKey: string,
): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "X-Kit-Api-Key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    signal,
    cache: "no-store",
  });
  if (res.status !== 200 && res.status !== 201) throw new KitError(step, res.status);
  return res.json().catch(() => null);
}

function numberAt(data: unknown, key: string): number | null {
  const obj = (data as Record<string, { id?: unknown } | undefined> | null)?.[key];
  return typeof obj?.id === "number" ? obj.id : null;
}

/**
 * Create the subscriber, apply the consent tag, add to the form. The form's
 * double opt-in setting sends the confirmation (incentive) email.
 * Existing addresses come back 200 at each step and count as success.
 * Order matters: the tag lands before the form, so a failure midway leaves a
 * tagged subscriber who has not been emailed, never the reverse.
 */
export async function subscribeToKit(params: {
  email: string;
  consentTag: string;
  referrer: string;
}): Promise<KitResult> {
  const apiKey = process.env.KIT_API_KEY?.trim();
  const formId = process.env.KIT_FORM_ID?.trim();
  if (!apiKey || !formId || !/^\d+$/.test(formId)) {
    console.error("[subscribe] KIT_API_KEY or KIT_FORM_ID is missing or malformed");
    return { ok: false, reason: "config" };
  }

  const signal = AbortSignal.timeout(TIMEOUT_MS);
  try {
    // "inactive" is Kit's unconfirmed state. Never create someone as active
    // before they confirm. Not applied to existing subscribers (docs).
    const created = await kit(
      "create_subscriber",
      "/subscribers",
      { email_address: params.email, state: "inactive" },
      signal,
      apiKey,
    );
    const subscriberId = numberAt(created, "subscriber");
    if (subscriberId === null) throw new KitError("create_subscriber_shape", 0);

    let tagId = tagIds.get(params.consentTag);
    if (tagId === undefined) {
      const tag = await kit("create_tag", "/tags", { name: params.consentTag }, signal, apiKey);
      const id = numberAt(tag, "tag");
      if (id === null) throw new KitError("create_tag_shape", 0);
      tagId = id;
      tagIds.set(params.consentTag, tagId);
    }
    await kit("tag_subscriber", `/tags/${tagId}/subscribers`, { email_address: params.email }, signal, apiKey);

    await kit(
      "add_to_form",
      `/forms/${formId}/subscribers/${subscriberId}`,
      { referrer: params.referrer },
      signal,
      apiKey,
    );
    return { ok: true };
  } catch (err) {
    if (err instanceof KitError) {
      // Status and step only. Never the email, key or response body.
      console.error(`[subscribe] ${err.message}`);
      if (err.step === "create_subscriber" && err.status === 422) {
        return { ok: false, reason: "invalid_email" };
      }
    } else {
      const name = err instanceof Error ? err.name : "unknown";
      console.error(`[subscribe] Kit request failed: ${name}`);
    }
    return { ok: false, reason: "upstream" };
  }
}
