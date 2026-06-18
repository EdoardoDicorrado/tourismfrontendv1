"use client";

import Link from "next/link";
import { useState } from "react";

import { fieldInputClass, Flash, SubmitButton } from "@/components/account/ui";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type SignupError = "emailTaken" | "generic" | null;

/** True when a Laravel-style validation `details` object flags an email field. */
function isEmailValidation(details: unknown): boolean {
  if (!details || typeof details !== "object") return false;
  return Object.keys(details as Record<string, unknown>).some((k) => /email/i.test(k));
}

/**
 * Customer registration form (classic email+password). Submits to the
 * `/api/auth/customer/register` BFF; on success the parent view swaps to the
 * "check your email" notice via `onSuccess` (double opt-in — no session yet).
 *
 * Inputs are controlled (`useState`); React Compiler is ON → state mutates only
 * from event handlers. A backend `422` with an email-keyed detail maps to the
 * "email already in use" message (the user should use Forgot password instead).
 */
export function CustomerSignupForm({
  lang,
  dict,
  onSuccess,
}: {
  lang: Locale;
  dict: Dictionary["account"]["customerSignup"];
  onSuccess: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [policyCheck, setPolicyCheck] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<SignupError>(null);
  // Client-side validation, surfaced via dedicated dict keys so the two distinct
  // failures (password mismatch, missing policy) are distinguishable.
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setLocalError(null);

    if (password !== passwordConfirm) {
      setLocalError(dict.passwordMismatch);
      return;
    }
    if (!policyCheck) {
      setLocalError(dict.policyRequired);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          password_confirm: passwordConfirm,
          policy_check: policyCheck,
          locale: lang,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; details?: unknown };
      if (res.ok && data.ok) {
        onSuccess();
        return;
      }
      if (data.error === "validation_failed" && isEmailValidation(data.details)) {
        setError("emailTaken");
      } else {
        setError("generic");
      }
    } catch {
      setError("generic");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="first_name" className="mb-1 block text-sm font-bold text-ink">
            {dict.firstName}
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={fieldInputClass}
          />
        </div>
        <div>
          <label htmlFor="last_name" className="mb-1 block text-sm font-bold text-ink">
            {dict.lastName}
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            autoComplete="family-name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={fieldInputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="signup-email" className="mb-1 block text-sm font-bold text-ink">
          {dict.email}
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldInputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="signup-password" className="mb-1 block text-sm font-bold text-ink">
            {dict.password}
          </label>
          <input
            id="signup-password"
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
          <label htmlFor="signup-password-confirm" className="mb-1 block text-sm font-bold text-ink">
            {dict.passwordConfirm}
          </label>
          <input
            id="signup-password-confirm"
            name="password_confirm"
            type="password"
            autoComplete="new-password"
            required
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className={fieldInputClass}
          />
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-ink/80">
        <input
          type="checkbox"
          checked={policyCheck}
          onChange={(e) => setPolicyCheck(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-cta"
        />
        <span>{dict.policyCheck}</span>
      </label>

      {localError && <Flash variant="error">{localError}</Flash>}
      {error === "emailTaken" && <Flash variant="error">{dict.emailTaken}</Flash>}
      {error === "generic" && <Flash variant="error">{dict.error}</Flash>}

      <SubmitButton loading={submitting} loadingLabel={dict.submitting}>
        {dict.submit}
      </SubmitButton>

      <p className="text-center text-sm text-ink/70">
        {dict.haveAccount}{" "}
        <Link href={`/${lang}/area/accedi`} className="font-bold text-cta hover:underline">
          {dict.backToLogin}
        </Link>
      </p>
    </form>
  );
}
