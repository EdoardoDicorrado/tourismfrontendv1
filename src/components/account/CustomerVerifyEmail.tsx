"use client";

import { useState } from "react";

import { fieldInputClass, Flash, SubmitButton } from "@/components/account/ui";
import { ButtonLink } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type VerifyDict = Dictionary["account"]["verifyEmail"];
type VerifyState = "idle" | "verifying" | "ok" | "error";

/**
 * Customer email verification (double opt-in). The page reads the `?token=` from
 * the link server-side and passes it in. With a token, the user confirms via a
 * button — NOT an effect (React Compiler is ON, no setState-in-effect); without a
 * token, a "resend verification email" sub-form is shown. Neither path reads
 * storage, so no `useSyncExternalStore`/`useHydrated` is needed.
 */
export function CustomerVerifyEmail({
  lang,
  token,
  dict,
}: {
  lang: Locale;
  token?: string;
  dict: VerifyDict;
}) {
  if (token) {
    return <VerifyMode lang={lang} token={token} dict={dict} />;
  }
  return <ResendMode lang={lang} dict={dict} />;
}

function VerifyMode({ lang, token, dict }: { lang: Locale; token: string; dict: VerifyDict }) {
  const [state, setState] = useState<VerifyState>("idle");

  async function handleVerify() {
    if (state === "verifying") return;
    setState("verifying");
    try {
      const res = await fetch("/api/auth/customer/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, locale: lang }),
      });
      const data = (await res.json()) as { ok?: boolean };
      setState(res.ok && data.ok ? "ok" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <div className="flex flex-col gap-4">
        <Flash variant="success">{dict.success}</Flash>
        <ButtonLink href={`/${lang}/area/accedi`} size="md">
          {dict.goToLogin}
        </ButtonLink>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col gap-4">
        <Flash variant="error">{dict.error}</Flash>
        <ResendMode lang={lang} dict={dict} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink/70">{dict.subtitle}</p>
      <SubmitButton
        type="button"
        onClick={handleVerify}
        loading={state === "verifying"}
        loadingLabel={dict.verifying}
      >
        {dict.verify}
      </SubmitButton>
    </div>
  );
}

function ResendMode({ lang, dict }: { lang: Locale; dict: VerifyDict }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/auth/customer/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale: lang }),
      });
      setSent(true);
    } catch {
      setSent(true); // anti-enumeration: same confirmation regardless
    }
    setSubmitting(false);
  }

  if (sent) {
    return <Flash variant="success">{dict.resent}</Flash>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <p className="mb-2 text-sm text-ink/70">{dict.resendSubtitle}</p>
        <label htmlFor="resend-email" className="mb-1 block text-sm font-bold text-ink">
          {dict.email}
        </label>
        <input
          id="resend-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldInputClass}
        />
      </div>
      <SubmitButton loading={submitting} loadingLabel={dict.resending}>
        {dict.resend}
      </SubmitButton>
    </form>
  );
}
