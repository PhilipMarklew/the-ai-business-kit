import { NextResponse, type NextRequest } from "next/server";
import { copy } from "@/lib/copy";
import { site } from "@/lib/site";
import { subscribeToKit } from "@/lib/kit";
import { rateLimit } from "@/lib/rate-limit";
import { MAX_BODY_BYTES, parseSubscribeBody } from "@/lib/subscribe";

/**
 * POST /api/subscribe. Contract: docs/specs/S00-1-architecture.md.
 * Thin handler: limit, parse, validate, call Kit, shape the response.
 */
const PER_IP = { limit: 5, windowMs: 10 * 60 * 1000 };
// Kit allows 120 requests per minute per API key; a signup makes up to 4.
const GLOBAL = { limit: 20, windowMs: 60 * 1000 };

type ErrorCode = "invalid_email" | "consent_required" | "rate_limited" | "provider_unavailable";

function json(body: { ok: true } | { ok: false; error: ErrorCode }, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function rateLimited(retryAfterS: number) {
  return json({ ok: false, error: "rate_limited" }, 429, { "Retry-After": String(retryAfterS) });
}

/**
 * Read the body, stopping as soon as it passes `max` bytes (security audit F1).
 * Returns null when too large or unreadable, so the caller never buffers an
 * oversized upload into memory.
 */
async function readCapped(request: Request, max: number): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > max) {
        await reader.cancel().catch(() => {});
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

let warnedNoIp = false;

export async function POST(request: NextRequest) {
  // Railway is expected to set X-Real-IP at its edge (Viktor to confirm).
  // Without it every visitor would share one bucket, so 5 signups would lock
  // out the whole site. Skip the per-IP check and rely on the global cap.
  const ip = request.headers.get("x-real-ip")?.trim();
  if (ip) {
    const perIp = rateLimit(`subscribe:ip:${ip}`, PER_IP.limit, PER_IP.windowMs);
    if (!perIp.ok) return rateLimited(perIp.retryAfterS);
  } else if (!warnedNoIp && process.env.NODE_ENV === "production") {
    warnedNoIp = true;
    console.warn("[subscribe] No X-Real-IP header; per-IP limit is off, global cap only");
  }
  const all = rateLimit("subscribe:global", GLOBAL.limit, GLOBAL.windowMs);
  if (!all.ok) return rateLimited(all.retryAfterS);

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return json({ ok: false, error: "invalid_email" }, 400);

  // Content-Length is absent on chunked requests, so count bytes as they arrive.
  const text = await readCapped(request, MAX_BODY_BYTES);
  if (text === null) return json({ ok: false, error: "invalid_email" }, 400);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ ok: false, error: "invalid_email" }, 400);
  }

  const parsed = parseSubscribeBody(body);
  if (parsed.kind === "honeypot") return json({ ok: true }, 200);
  if (parsed.kind === "error") return json({ ok: false, error: parsed.error }, 400);

  const result = await subscribeToKit({
    email: parsed.email,
    consentTag: copy.signup.consentVersion,
    referrer: `${site.url}/newsletter`,
  });
  if (result.ok) return json({ ok: true }, 200);
  if (result.reason === "invalid_email") return json({ ok: false, error: "invalid_email" }, 400);
  return json({ ok: false, error: "provider_unavailable" }, 502);
}
