"use client";

import Link from "next/link";
import { useState } from "react";

import { AgencySignupForm } from "@/components/account/AgencySignupForm";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Agency signup view — holds the post-submit "pending activation" state and swaps
 * the form for a success notice. State is toggled only from the form's
 * `onSuccess` callback (an event handler path), never from an effect.
 */
export function AgencySignupView({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["account"]["agencySignup"];
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
            strokeWidth={2.5}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-ink">{dict.successTitle}</h2>
        <p className="rounded-[10px] bg-soft p-4 text-sm text-ink/70">{dict.success}</p>
        <Link
          href={`/${lang}/agenzie/accedi`}
          className="rounded-[10px] border border-cta px-6 py-3 text-sm font-extrabold text-cta transition-colors hover:bg-cta hover:text-white"
        >
          {dict.backToLogin}
        </Link>
      </div>
    );
  }

  return <AgencySignupForm lang={lang} dict={dict} onSuccess={() => setSubmitted(true)} />;
}
