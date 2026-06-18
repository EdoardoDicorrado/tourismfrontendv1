"use client";

import Link from "next/link";
import { useState } from "react";

import { CustomerSignupForm } from "@/components/account/CustomerSignupForm";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Customer signup view — holds the post-submit "check your email" state and swaps
 * the form for the verification notice. Double opt-in: no session is created, the
 * user must click the link in the email. State toggles only from the form's
 * `onSuccess` callback (an event-handler path), never from an effect.
 */
export function CustomerSignupView({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["account"]["customerSignup"];
}) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cta/10 text-cta">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6M3 7h18v10H3z" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-ink">{dict.successTitle}</h2>
        <p className="rounded-[10px] bg-soft p-4 text-sm text-ink/70">{dict.success}</p>
        <div className="flex flex-col items-center gap-2">
          <Link
            href={`/${lang}/area/accedi`}
            className="rounded-[10px] border border-cta px-6 py-3 text-sm font-extrabold text-cta transition-colors hover:bg-cta hover:text-white"
          >
            {dict.backToLogin}
          </Link>
          <Link
            href={`/${lang}/area/verifica-email`}
            className="text-sm font-semibold text-cta hover:underline"
          >
            {dict.resend}
          </Link>
        </div>
      </div>
    );
  }

  return <CustomerSignupForm lang={lang} dict={dict} onSuccess={() => setSubmitted(true)} />;
}
