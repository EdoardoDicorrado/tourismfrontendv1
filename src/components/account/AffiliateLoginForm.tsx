"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { fieldInputClass, SubmitButton } from "@/components/account/ui";
import { signInDemo } from "@/lib/auth/demoUser";
import type { Locale } from "@/lib/i18n/config";

/**
 * PREVIEW affiliate login (ui-ux). There is no real affiliate auth yet — the
 * affiliate role/session is pending full-stack — so the pre-filled demo
 * credentials just land on the affiliate dashboard. Like the customer login it
 * marks the demo user (`signInDemo`), so the rest of the storefront (e.g. the
 * checkout) recognises the affiliate as logged-in and shows the saved personal
 * data + payment methods in a read-only card, same as agency/customer. Strings
 * are hardcoded IT for this first pass (i18n deposited to marketing). Same
 * field/button primitives as the agency/customer login for a consistent look.
 */
export function AffiliateLoginForm({ lang }: { lang: Locale }) {
  const router = useRouter();
  const [email, setEmail] = useState("test@test.it");
  const [password, setPassword] = useState("test");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    // PREVIEW: mark the demo user so the affiliate is recognised as logged-in
    // across the storefront (checkout → saved personal data + payment cards).
    signInDemo({ name: "Mario Rossi", email, role: "affiliate" });
    router.push(`/${lang}/affiliati/dashboard`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor="affiliate-email" className="mb-1 block text-sm font-bold text-ink">
          Email
        </label>
        <input
          id="affiliate-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="affiliato@esempio.com"
          className={fieldInputClass}
        />
      </div>

      <div>
        <label htmlFor="affiliate-password" className="mb-1 block text-sm font-bold text-ink">
          Password
        </label>
        <input
          id="affiliate-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="La tua password"
          className={fieldInputClass}
        />
      </div>

      <SubmitButton loading={submitting}>Accedi</SubmitButton>

      <p className="text-center text-sm text-ink/70">
        Non sei registrato?{" "}
        <Link href={`/${lang}/partner/affiliati`} className="font-bold text-cta hover:underline">
          Diventa affiliato
        </Link>
      </p>
    </form>
  );
}
