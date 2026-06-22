"use client";

import { useState } from "react";

import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Security page password block: shows a masked read-only row with a "Modifica
 * password" trigger that opens the actual {@link ChangePasswordForm}. Keeps the
 * editor out of the way until the user asks to change the password.
 */
export function PasswordSection({
  lang,
  dict,
  feedback,
}: {
  lang: Locale;
  dict: Dictionary["account"]["changePassword"];
  feedback: Dictionary["account"]["feedback"];
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <ChangePasswordForm lang={lang} dict={dict} feedback={feedback} />;
  }

  return (
    <div className="flex max-w-lg items-center justify-between gap-3 rounded-panel border border-soft-grey bg-white p-6 sm:p-8">
      <p className="tracking-widest text-ink/60" aria-hidden>
        ••••••••
      </p>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="shrink-0 text-sm font-bold text-cta hover:underline"
      >
        {dict.edit}
      </button>
    </div>
  );
}
