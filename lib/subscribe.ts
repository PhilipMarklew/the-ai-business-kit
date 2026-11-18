/**
 * Validation for POST /api/subscribe. Pure functions, no HTTP, so they can be
 * unit tested. Contract: docs/specs/S00-1-architecture.md.
 */
export const MAX_BODY_BYTES = 2048;
const MAX_EMAIL = 254;
const MAX_LOCAL = 64;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

export type Parsed =
  | { kind: "honeypot" }
  | { kind: "error"; error: "invalid_email" | "consent_required" }
  | { kind: "ok"; email: string };

export function normaliseEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length === 0 || email.length > MAX_EMAIL) return null;
  if (CONTROL_CHARS.test(email) || !EMAIL_SHAPE.test(email)) return null;
  if (email.slice(0, email.lastIndexOf("@")).length > MAX_LOCAL) return null;
  return email;
}

export function parseSubscribeBody(body: unknown): Parsed {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { kind: "error", error: "invalid_email" };
  }
  const { email, consent, website } = body as Record<string, unknown>;

  // Honeypot first: a bot that filled it gets a quiet 200 and nothing happens.
  if (website !== undefined && website !== "") return { kind: "honeypot" };

  const clean = normaliseEmail(email);
  if (!clean) return { kind: "error", error: "invalid_email" };
  if (consent !== true) return { kind: "error", error: "consent_required" };
  return { kind: "ok", email: clean };
}
