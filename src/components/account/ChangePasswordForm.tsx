"use client";

import { useState } from "react";

import { Flash, SubmitButton, fieldInputClass } from "@/components/account/ui";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Agency password change (`/[lang]/agenzie/profilo/password`).
 *
 * Mirrors tatanka2's UpdatePasswordForm: current + new + confirm. Posts to
 * `/api/agency/password`; the BFF returns specific 422 errors which we map to
 * the localized messages (`wrong_current` → errorCurrent, `mismatch` →
 * mismatch). Confirm mismatch is also checked client-side before submitting.
 * On success the fields are cleared and a success flash is shown.
 *
 * React Compiler is ON: local `useState` only, mutated in the onSubmit handler.
 */

type Status = "idle" | "saving" | "success" | "errorCurrent" | "mismatch" | "error";

const labelClass = "mb-1 block text-sm font-bold text-ink";

export function ChangePasswordForm({
  lang,
  dict,
  feedback,
}: {
  lang: Locale;
  dict: Dictionary["account"]["changePassword"];
  feedback: Dictionary["account"]["feedback"];
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "saving") return;
    if (next !== confirm) {
      setStatus("mismatch");
      return;
    }
    setStatus("saving");
    try {
      const res = await fetch("/api/agency/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale: lang,
          current_password: current,
          new_password: next,
          new_password_confirm: confirm,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setCurrent("");
        setNext("");
        setConfirm("");
        setStatus("success");
        return;
      }
      if (data.error === "wrong_current" || data.error === "missing_current") {
        setStatus("errorCurrent");
      } else if (data.error === "mismatch") {
        setStatus("mismatch");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-[480px] flex-col gap-4 rounded-[15px] border border-soft-grey bg-white p-6 sm:p-8"
    >
      <div>
        <label htmlFor="current_password" className={labelClass}>
          {dict.current}
        </label>
        <input
          id="current_password"
          name="current_password"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className={fieldInputClass}
        />
      </div>
      <div>
        <label htmlFor="new_password" className={labelClass}>
          {dict.next}
        </label>
        <input
          id="new_password"
          name="new_password"
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className={fieldInputClass}
        />
      </div>
      <div>
        <label htmlFor="new_password_confirm" className={labelClass}>
          {dict.confirm}
        </label>
        <input
          id="new_password_confirm"
          name="new_password_confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={fieldInputClass}
        />
      </div>

      {status === "success" ? <Flash variant="success">{dict.success}</Flash> : null}
      {status === "errorCurrent" ? <Flash variant="error">{dict.errorCurrent}</Flash> : null}
      {status === "mismatch" ? <Flash variant="error">{dict.mismatch}</Flash> : null}
      {status === "error" ? <Flash variant="error">{feedback.error}</Flash> : null}

      <div className="mt-2">
        <SubmitButton loading={status === "saving"} loadingLabel={dict.submitting}>
          {dict.submit}
        </SubmitButton>
      </div>
    </form>
  );
}
