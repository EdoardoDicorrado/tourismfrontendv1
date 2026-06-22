"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { fieldInputClass, Flash, SubmitButton } from "@/components/account/ui";
import { signInDemo, type DemoUser } from "@/lib/auth/demoUser";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Step = "email" | "password" | "register" | "verify";

/**
 * Client fallback for the email-first branch. The branch is decided server-side by
 * `POST /api/auth/customer/exists` (itself a preview heuristic until the backend
 * exposes the real check); this mirror only runs if that request fails (offline).
 * Any `@tourismotion.it` address → existing account (password step); else register.
 */
function emailExistsPreview(email: string): boolean {
  return email.trim().toLowerCase().endsWith("@tourismotion.it");
}

/**
 * Customer access — email-first, GetYourGuide-style (no social). Step 1 takes the
 * email; the backend decides the branch: an existing account → password (sign in);
 * a new email → registration (full name + password) → emailed verification code.
 *
 * Rendered both inside {@link LoginModal} (pass `onDone` to close it) and on the
 * `/area/accedi` page (no `onDone` → it just navigates). The auth itself is a UI
 * PREVIEW — the storefront customer-auth API is still being defined (CLAUDE.md),
 * so the lookup, sign-in, registration and code verification go to full-stack.
 */
export function CustomerLoginForm({
  lang,
  dict,
  onDone,
}: {
  lang: Locale;
  dict: Dictionary["account"]["customerLogin"];
  /**
   * Called with the signed-in user when the flow completes (the modal passes it to
   * the demo "logged in" store and closes — no navigation, since the gated /area
   * pages would bounce in preview). When absent (the /area/accedi page), the form
   * navigates to the bookings list instead (real session works; preview bounces).
   */
  onDone?: (user: DemoUser) => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  // DEMO PREFILL: an @tourismotion.it address branches to sign-in (see
  // emailExistsPreview) so the avatar-menu demo logs in immediately. Remove once
  // the real customer-auth backend is wired.
  const [email, setEmail] = useState("mario.rossi@tourismotion.it");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("demo1234");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Display name: the typed full name, else a title-cased email local part ("mario.rossi" → "Mario Rossi"). */
  function displayName(): string {
    const typed = fullName.trim();
    if (typed) return typed;
    const local = email.split("@")[0] ?? "";
    if (!local) return email;
    return local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  /**
   * Logged in. Always set the demo "logged in" user (preview) so the header avatar
   * reflects it in BOTH the modal and the `/area/accedi` page — otherwise the page
   * flow set no state and only navigated, so it silently did nothing in preview.
   * With `onDone` (modal) hand the user up and close; otherwise navigate. NB the
   * gated /area pages still need a real (or mock) session cookie to open — that's
   * the customer-auth backend / preview short-circuit (full-stack).
   */
  function finish() {
    const user: DemoUser = { name: displayName(), email };
    signInDemo(user);
    if (onDone) {
      onDone(user);
      return;
    }
    router.push(`/${lang}/area/prenotazioni`);
    router.refresh();
  }

  function backToEmail() {
    setStep("email");
    setError(null);
  }

  /** Step 1: ask the BFF which branch this email takes (sign-in vs register). */
  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    let exists = emailExistsPreview(email);
    try {
      const res = await fetch("/api/auth/customer/exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale: lang }),
      });
      const data = (await res.json()) as { ok?: boolean; exists?: boolean };
      if (res.ok && data.ok && typeof data.exists === "boolean") exists = data.exists;
    } catch {
      /* network → keep the client heuristic so the flow still branches */
    }
    setSubmitting(false);
    setStep(exists ? "password" : "register");
  }

  /** Step 2a (existing account): sign in. Backend absent → advance in preview. */
  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, locale: lang }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (res.ok && data.ok) {
        finish();
        return;
      }
      if (res.status === 401) {
        setError(dict.error);
        setSubmitting(false);
        return;
      }
      if (res.status === 403) {
        setError(dict.notVerified);
        setSubmitting(false);
        return;
      }
      // 502 / backend not live yet → preview: advance so the flow stays testable.
      finish();
    } catch {
      finish(); // network → preview
    }
  }

  /** Step 2b (new email): create the account, then emailed code verification. */
  async function submitRegister(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    // "Nome completo" → first + last (the backend requires both). One word → reuse it.
    const [firstName, ...rest] = fullName.trim().split(/\s+/);
    const lastName = rest.join(" ") || firstName;
    try {
      const res = await fetch("/api/auth/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          password_confirm: password,
          policy_check: true,
          locale: lang,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (res.ok && data.ok) {
        setSubmitting(false);
        setStep("verify");
        return;
      }
      if (res.status === 422) {
        setError(dict.error);
        setSubmitting(false);
        return;
      }
      // 502 / backend not live yet → preview: advance to code verification.
      setSubmitting(false);
      setStep("verify");
    } catch {
      setSubmitting(false);
      setStep("verify"); // network → preview
    }
  }

  /** Step 3 (new account): confirm the emailed code, then land on the bookings. */
  async function submitVerify(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    // TODO(full-stack): POST {code} for {email} to the (future) OTP-code verify
    // endpoint, which sets the session cookie. NB the existing
    // `/api/auth/customer/verify-email` route takes the email LINK token, not this
    // numeric code, so it doesn't fit here — a code endpoint is still to be defined.
    // Until then this is a preview step (accepts any code and finishes).
    setSubmitting(false);
    finish();
  }

  const subtitle =
    step === "verify"
      ? fill(dict.verifySubtitle, { email })
      : step === "password"
        ? dict.passwordSubtitle
        : dict.subtitle;

  /** The entered email, shown read-only with an inline "edit" back to step 1. */
  const emailPill = (
    <div className="flex items-center justify-between gap-3 rounded-card border border-stroke bg-soft/40 px-4 py-3">
      <span className="min-w-0 truncate text-sm font-semibold text-ink">{email}</span>
      <button
        type="button"
        onClick={backToEmail}
        className="shrink-0 text-sm font-bold text-cta hover:underline"
      >
        {dict.edit}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{dict.title}</h1>
        <p className="mt-2 text-ink/70">{subtitle}</p>
      </div>

      {step === "email" && (
        <form onSubmit={submitEmail} className="flex flex-col gap-4" noValidate>
          <Labelled htmlFor="customer-email" label={dict.email}>
            <input
              id="customer-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={dict.emailPlaceholder}
              className={fieldInputClass}
            />
          </Labelled>
          <SubmitButton loading={submitting}>{dict.continue}</SubmitButton>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={submitPassword} className="flex flex-col gap-4" noValidate>
          {emailPill}
          <Labelled
            htmlFor="customer-password"
            label={dict.password}
            addon={
              <Link
                href={`/${lang}/area/recupera-password`}
                className="text-sm font-semibold text-cta hover:underline"
              >
                {dict.forgot}
              </Link>
            }
          >
            <input
              id="customer-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={dict.passwordPlaceholder}
              className={fieldInputClass}
            />
          </Labelled>
          {error && <Flash variant="error">{error}</Flash>}
          <SubmitButton loading={submitting} loadingLabel={dict.submitting}>
            {dict.submit}
          </SubmitButton>
        </form>
      )}

      {step === "register" && (
        <form onSubmit={submitRegister} className="flex flex-col gap-4" noValidate>
          {emailPill}
          <Labelled htmlFor="customer-name" label={dict.fullName}>
            <input
              id="customer-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={dict.fullNamePlaceholder}
              className={fieldInputClass}
            />
          </Labelled>
          <Labelled htmlFor="customer-new-password" label={dict.password}>
            <input
              id="customer-new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={dict.passwordPlaceholder}
              className={fieldInputClass}
            />
          </Labelled>
          {error && <Flash variant="error">{error}</Flash>}
          <SubmitButton loading={submitting} loadingLabel={dict.submitting}>
            {dict.continue}
          </SubmitButton>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={submitVerify} className="flex flex-col gap-4" noValidate>
          {emailPill}
          <Labelled htmlFor="customer-code" label={dict.verifyCodeLabel}>
            <input
              id="customer-code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={dict.verifyCodePlaceholder}
              className={fieldInputClass}
            />
          </Labelled>
          {error && <Flash variant="error">{error}</Flash>}
          <SubmitButton loading={submitting} loadingLabel={dict.verifying}>
            {dict.verifyCta}
          </SubmitButton>
        </form>
      )}
    </div>
  );
}

/** Label + optional right-aligned addon (e.g. "forgot password?") over a control. */
function Labelled({
  htmlFor,
  label,
  addon,
  children,
}: {
  htmlFor: string;
  label: string;
  addon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="block text-sm font-bold text-ink">
          {label}
        </label>
        {addon}
      </div>
      {children}
    </div>
  );
}
