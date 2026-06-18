"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { fieldInputClass, Flash, SubmitButton } from "@/components/account/ui";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type LoginError = "credentials" | "notVerified" | "generic" | null;
type ResendState = "idle" | "sending" | "sent";

/**
 * Customer sign-in form (email + password). Submits to the `/api/auth/customer/login`
 * BFF, which sets the httpOnly session cookie on success; this component never sees
 * a token. On success it navigates to the customer bookings list.
 *
 * When the backend reports the email isn't verified yet (double opt-in), a
 * dedicated notice offers an inline "resend verification email" action. Inputs are
 * controlled (`useState`); React Compiler is ON → state mutates only from event
 * handlers, never from an effect.
 */
export function CustomerLoginForm({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["account"]["customerLogin"];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<LoginError>(null);
  const [resend, setResend] = useState<ResendState>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setResend("idle");
    try {
      const res = await fetch("/api/auth/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, locale: lang }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        // Cookie already set by the BFF — navigate to the bookings list.
        // Don't reset `submitting`: we're leaving this view.
        router.push(`/${lang}/area/prenotazioni`);
        router.refresh();
        return;
      }
      if (data.error === "email_not_verified") {
        setError("notVerified");
      } else if (res.status === 401 || data.error === "bad_credentials") {
        setError("credentials");
      } else {
        setError("generic");
      }
    } catch {
      setError("generic");
    }
    setSubmitting(false);
  }

  async function handleResend() {
    if (resend === "sending") return;
    setResend("sending");
    try {
      await fetch("/api/auth/customer/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale: lang }),
      });
    } catch {
      // Anti-enumeration: show the same confirmation regardless of outcome.
    }
    setResend("sent");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor="customer-email" className="mb-1 block text-sm font-bold text-ink">
          {dict.email}
        </label>
        <input
          id="customer-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={dict.emailPlaceholder}
          className={fieldInputClass}
        />
      </div>

      <div>
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <label htmlFor="customer-password" className="block text-sm font-bold text-ink">
            {dict.password}
          </label>
          <Link
            href={`/${lang}/area/recupera-password`}
            className="text-sm font-semibold text-cta hover:underline"
          >
            {dict.forgot}
          </Link>
        </div>
        <input
          id="customer-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={dict.passwordPlaceholder}
          className={fieldInputClass}
        />
      </div>

      {error === "notVerified" && (
        <div className="flex flex-col gap-2">
          <Flash variant="info">{dict.notVerified}</Flash>
          {resend === "sent" ? (
            <Flash variant="success">{dict.resent}</Flash>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resend === "sending"}
              className="text-left text-sm font-bold text-cta underline disabled:opacity-60"
            >
              {resend === "sending" ? dict.resending : dict.resend}
            </button>
          )}
        </div>
      )}
      {(error === "credentials" || error === "generic") && (
        <Flash variant="error">{dict.error}</Flash>
      )}

      <SubmitButton loading={submitting} loadingLabel={dict.submitting}>
        {dict.submit}
      </SubmitButton>

      <p className="text-center text-sm text-ink/70">
        {dict.noAccount}{" "}
        <Link href={`/${lang}/area/registrati`} className="font-bold text-cta hover:underline">
          {dict.register}
        </Link>
      </p>
    </form>
  );
}
