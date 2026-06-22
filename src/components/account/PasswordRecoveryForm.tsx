"use client";

import Link from "next/link";
import { useState } from "react";

import { fieldInputClass, Flash, SubmitButton } from "@/components/account/ui";
import { ButtonLink } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type ForgotDict = Dictionary["account"]["forgotPassword"];
type ResetDict = Dictionary["account"]["resetPassword"];

/**
 * Password recovery form. One component, two modes driven by `token`:
 *   - no `token` → "forgot" mode: ask for the email, POST `{ action: "forgot" }`.
 *     The success message is always shown (anti-enumeration).
 *   - `token` present → "reset" mode: ask for the new password + confirm, POST
 *     `{ action: "reset", email, token, password, password_confirm }`. The Laravel
 *     broker keys on email + token, so the reset link carries both (`?token=…&email=…`).
 *
 * Submits to the `/api/auth/password` BFF. No session is created — after a
 * successful reset the user logs in normally.
 */
export function PasswordRecoveryForm({
  lang,
  token,
  email,
  forgot,
  reset,
  backToLoginHref,
}: {
  lang: Locale;
  token?: string;
  email?: string;
  forgot: ForgotDict;
  reset: ResetDict;
  /** Where "back to sign in" links go — `/area/accedi` (customer) or `/agenzie/accedi` (agency). */
  backToLoginHref: string;
}) {
  if (token) {
    return (
      <ResetMode
        lang={lang}
        token={token}
        email={email}
        dict={reset}
        forgot={forgot}
        backToLoginHref={backToLoginHref}
      />
    );
  }
  return <ForgotMode lang={lang} dict={forgot} backToLoginHref={backToLoginHref} />;
}

function ForgotMode({
  lang,
  dict,
  backToLoginHref,
}: {
  lang: Locale;
  dict: ForgotDict;
  backToLoginHref: string;
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forgot", email, locale: lang }),
      });
      // Anti-enumeration: always show the same confirmation regardless of outcome.
      setSent(true);
    } catch {
      // Even on a network error we keep the neutral message (don't leak state).
      setSent(true);
    }
    setSubmitting(false);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <Flash variant="success">{dict.sent}</Flash>
        <Link
          href={backToLoginHref}
          className="text-center text-sm font-bold text-cta hover:underline"
        >
          {dict.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor="forgot-email" className="mb-1 block text-sm font-bold text-ink">
          {dict.email}
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldInputClass}
        />
      </div>
      <SubmitButton loading={submitting} loadingLabel={dict.submitting}>
        {dict.submit}
      </SubmitButton>
      <Link
        href={backToLoginHref}
        className="text-center text-sm font-bold text-cta hover:underline"
      >
        {dict.backToLogin}
      </Link>
    </form>
  );
}

function ResetMode({
  lang,
  token,
  email: emailFromLink,
  dict,
  forgot,
  backToLoginHref,
}: {
  lang: Locale;
  token: string;
  email?: string;
  dict: ResetDict;
  forgot: ForgotDict;
  backToLoginHref: string;
}) {
  // The broker needs email + token. Normally both arrive in the reset link; if the
  // email is missing we let the user type it (it's already in their inbox anyway).
  const lockedEmail = Boolean(emailFromLink);
  const [email, setEmail] = useState(emailFromLink ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<"mismatch" | "invalid" | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (password !== confirm) {
      setError("mismatch");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset",
          email,
          token,
          password,
          password_confirm: confirm,
          locale: lang,
        }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (res.ok && data.ok) {
        setDone(true);
        return;
      }
      setError("invalid");
    } catch {
      setError("invalid");
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <Flash variant="success">{dict.success}</Flash>
        <ButtonLink href={backToLoginHref} size="md">
          {forgot.backToLogin}
        </ButtonLink>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor="reset-email" className="mb-1 block text-sm font-bold text-ink">
          {forgot.email}
        </label>
        <input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          readOnly={lockedEmail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${fieldInputClass}${lockedEmail ? " bg-soft-grey/40 text-ink/70" : ""}`}
        />
      </div>
      <div>
        <label htmlFor="reset-password" className="mb-1 block text-sm font-bold text-ink">
          {dict.newPassword}
        </label>
        <input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldInputClass}
        />
      </div>
      <div>
        <label htmlFor="reset-confirm" className="mb-1 block text-sm font-bold text-ink">
          {dict.confirmPassword}
        </label>
        <input
          id="reset-confirm"
          name="password_confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={fieldInputClass}
        />
      </div>
      {error === "mismatch" && <Flash variant="error">{dict.mismatch}</Flash>}
      {error === "invalid" && <Flash variant="error">{dict.error}</Flash>}
      <SubmitButton loading={submitting} loadingLabel={dict.submitting}>
        {dict.submit}
      </SubmitButton>
    </form>
  );
}
