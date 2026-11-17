"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { postSubscribe, type SubscribeError } from "@/lib/subscribe-client";

type Status = "idle" | "sending" | "success";
type FieldError = SubscribeError | "network" | null;

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email signup. Presentational shell wired to the POST /api/subscribe contract
 * through lib/subscribe-client.ts. States: idle, sending (button disabled),
 * error (inline, no reload), success.
 */
export function SignupForm() {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<FieldError>(null);

  const emailId = `${id}-email`;
  const consentId = `${id}-consent`;
  const emailErrId = `${id}-email-err`;
  const consentErrId = `${id}-consent-err`;
  const formErrId = `${id}-form-err`;

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const consent = form.get("consent") === "on";
    const website = String(form.get("website") ?? "");

    if (!email || email.length > 254 || !EMAIL_SHAPE.test(email)) {
      setError("invalid_email");
      return;
    }
    if (!consent) {
      setError("consent_required");
      return;
    }
    setError(null);
    setStatus("sending");
    const result = await postSubscribe({ email, consent: true, website });
    if (result.ok) {
      setStatus("success");
    } else {
      setError(result.error);
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="font-medium">
        {copy.signup.success}
      </p>
    );
  }

  const sending = status === "sending";
  const emailError = error === "invalid_email";
  const consentError = error === "consent_required";
  const formError = error && !emailError && !consentError ? error : null;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={emailId} className="text-sm font-medium">
          {copy.signup.label}
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          disabled={sending}
          aria-invalid={emailError}
          aria-describedby={emailError ? emailErrId : undefined}
          className="h-11 w-full rounded-control border border-muted bg-surface px-3 text-base text-ink disabled:opacity-60"
        />
        {emailError && (
          <p id={emailErrId} className="text-sm">
            <strong>Error:</strong> {copy.signup.errors.invalid_email}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots fill it. Contract: must stay "". */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <input
            id={consentId}
            name="consent"
            type="checkbox"
            disabled={sending}
            aria-invalid={consentError}
            aria-describedby={consentError ? consentErrId : undefined}
            className="mt-1 size-5 shrink-0 accent-accent"
          />
          <p className="text-sm text-muted">
            <label htmlFor={consentId}>{copy.signup.consent}</label>{" "}
            <Link href="/privacy">{copy.signup.privacyLinkText}</Link>
          </p>
        </div>
        {consentError && (
          <p id={consentErrId} className="text-sm">
            <strong>Error:</strong> {copy.signup.errors.consent_required}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={sending} className="h-11 px-5 text-base sm:self-start">
          {sending ? copy.signup.sending : copy.signup.button}
        </Button>
        <p id={formErrId} role="alert" className="text-sm">
          {formError && (
            <>
              <strong>Error:</strong> {copy.signup.errors[formError]}
            </>
          )}
        </p>
      </div>
    </form>
  );
}
