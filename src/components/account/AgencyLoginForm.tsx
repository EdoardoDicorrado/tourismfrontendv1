"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { fieldInputClass, Flash, SubmitButton } from "@/components/account/ui";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type LoginError = "credentials" | "notActive" | "generic" | null;

/**
 * Agency sign-in form (email + password). Submits to the `/api/auth/agency` BFF,
 * which sets the httpOnly session cookie on success; this component never sees a
 * token. On success it navigates to the agency bookings list.
 *
 * Inputs are controlled (`useState`) so we use bare `<input className={fieldInputClass}>`
 * rather than the uncontrolled `<Field>` primitive. React Compiler is ON → state
 * is mutated only from event handlers, never from an effect.
 */
export function AgencyLoginForm({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["account"]["agencyLogin"];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<LoginError>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, locale: lang }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        // Cookie already set by the BFF — navigate to the agency bookings list.
        // Don't reset `submitting`: we're leaving this view.
        router.push(`/${lang}/agenzie/prenotazioni`);
        router.refresh();
        return;
      }
      if (res.status === 403 || data.error === "agency_not_active") {
        setError("notActive");
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor="agency-email" className="mb-1 block text-sm font-bold text-ink">
          {dict.email}
        </label>
        <input
          id="agency-email"
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
          <label htmlFor="agency-password" className="block text-sm font-bold text-ink">
            {dict.password}
          </label>
          <Link
            href={`/${lang}/agenzie/recupera-password`}
            className="text-sm font-semibold text-cta hover:underline"
          >
            {dict.forgot}
          </Link>
        </div>
        <input
          id="agency-password"
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

      {error === "notActive" && <Flash variant="info">{dict.notActive}</Flash>}
      {(error === "credentials" || error === "generic") && (
        <Flash variant="error">{dict.error}</Flash>
      )}

      <SubmitButton loading={submitting} loadingLabel={dict.submitting}>
        {dict.submit}
      </SubmitButton>

      <p className="text-center text-sm text-ink/70">
        {dict.noAccount}{" "}
        <Link href={`/${lang}/agenzie/registrati`} className="font-bold text-cta hover:underline">
          {dict.register}
        </Link>
      </p>
    </form>
  );
}
