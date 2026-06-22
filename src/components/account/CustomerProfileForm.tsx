"use client";

import { useState } from "react";

import { Flash, SubmitButton, fieldInputClass } from "@/components/account/ui";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Customer personal-details form (`/[lang]/area/profilo`).
 *
 * PREVIEW: client-only mock — there is no customer-profile backend yet (only the
 * agency has GET/PATCH /agency/profile). Submitting just flashes success; nothing
 * is persisted. Wiring (a `GET/PATCH /account/profile` seam + BFF route) is a
 * full-stack task. Prefilled from the session name passed by the page.
 *
 * ponytail: mock submit, swap for a real `fetch('/api/account/profile')` once the
 * customer-profile endpoint lands.
 */

const labelClass = "mb-1 block text-sm font-bold text-ink";

export function CustomerProfileForm({
  dict,
  feedback,
  initial,
}: {
  dict: Dictionary["account"]["customerSettings"];
  feedback: Dictionary["account"]["feedback"];
  initial: { firstName: string; lastName: string; email: string; phone: string };
}) {
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaved(false);
    // PREVIEW: no backend — flash success immediately and collapse to read-only.
    setSaving(false);
    setSaved(true);
    setEditing(false);
  }

  // Read-only review: i dati salvati + "Modifica" per editarli (come il checkout).
  if (!editing) {
    const fullName = `${firstName} ${lastName}`.trim();
    return (
      <div className="flex max-w-lg flex-col gap-1 rounded-panel border border-soft-grey bg-white p-6 text-base text-ink sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <p className="font-bold">{fullName || "—"}</p>
          <button
            type="button"
            onClick={() => {
              setSaved(false);
              setEditing(true);
            }}
            className="shrink-0 text-sm font-bold text-cta hover:underline"
          >
            {dict.edit}
          </button>
        </div>
        <p className="break-all">{email || "—"}</p>
        <p>{phone || "—"}</p>
        {saved ? (
          <div className="mt-3">
            <Flash variant="success">{feedback.saved}</Flash>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-lg flex-col gap-4 rounded-panel border border-soft-grey bg-white p-6 sm:p-8"
    >
      <div>
        <label htmlFor="first_name" className={labelClass}>
          {dict.firstName}
        </label>
        <input
          id="first_name"
          name="first_name"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={fieldInputClass}
        />
      </div>
      <div>
        <label htmlFor="last_name" className={labelClass}>
          {dict.lastName}
        </label>
        <input
          id="last_name"
          name="last_name"
          type="text"
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={fieldInputClass}
        />
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>
          {dict.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldInputClass}
        />
      </div>
      <div>
        <label htmlFor="phone" className={labelClass}>
          {dict.phone}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={fieldInputClass}
        />
      </div>

      {saved ? <Flash variant="success">{feedback.saved}</Flash> : null}

      <div className="mt-2">
        <SubmitButton loading={saving} loadingLabel={dict.saving}>
          {dict.save}
        </SubmitButton>
      </div>
    </form>
  );
}
