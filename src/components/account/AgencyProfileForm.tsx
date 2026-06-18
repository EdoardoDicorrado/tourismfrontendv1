"use client";

import { useState } from "react";

import { Flash, SubmitButton, fieldInputClass } from "@/components/account/ui";
import { locales } from "@/lib/i18n/config";
import type { AgencyProfile } from "@/lib/account/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Agency profile editor (`/[lang]/agenzie/profilo`).
 *
 * Controlled client form: the login user (name / email / phone / preferred
 * locale) + the company data. The admin-managed values (agency code, commission,
 * API access) are shown disabled with an explanatory note — the BFF drops them
 * even if posted. Submits PATCH `/api/agency/profile` (`{ user, agency }`); the
 * BFF returns the merged profile, which we adopt as the new baseline so the
 * success state sticks.
 *
 * React Compiler is ON: all state is local `useState`, mutated only inside the
 * onSubmit handler (no setState-in-effect).
 */

type Status = "idle" | "saving" | "saved" | "error";

const labelClass = "mb-1 block text-sm font-bold text-ink";

const LOCALE_LABELS: Record<Locale, string> = {
  it: "Italiano",
  en: "English",
  es: "Español",
};

/** Shape of the controlled fields (all strings — country is the ISO alpha-2 code). */
interface FormState {
  // user (login account)
  name: string;
  email: string;
  phone: string;
  locale: string;
  // agency (editable company data)
  legal_name: string;
  display_name: string;
  address_street: string;
  address_street_number: string;
  postal_code: string;
  city: string;
  country_alpha2: string;
  phone_prefix: string;
  company_phone: string;
  company_email: string;
  website: string;
  facebook_url: string;
  tripadvisor_url: string;
  description: string;
  collaboration_reason: string;
}

function toFormState(p: AgencyProfile): FormState {
  return {
    name: p.user.name ?? "",
    email: p.user.email ?? "",
    phone: p.user.phone ?? "",
    locale: p.user.locale ?? "",
    legal_name: p.agency.legal_name ?? "",
    display_name: p.agency.display_name ?? "",
    address_street: p.agency.address_street ?? "",
    address_street_number: p.agency.address_street_number ?? "",
    postal_code: p.agency.postal_code ?? "",
    city: p.agency.city ?? "",
    country_alpha2: p.agency.country_alpha2 ?? "",
    phone_prefix: p.agency.phone_prefix ?? "",
    company_phone: p.agency.phone ?? "",
    company_email: p.agency.email ?? "",
    website: p.agency.website ?? "",
    facebook_url: p.agency.facebook_url ?? "",
    tripadvisor_url: p.agency.tripadvisor_url ?? "",
    description: p.agency.description ?? "",
    collaboration_reason: p.agency.collaboration_reason ?? "",
  };
}

/** "8.0" → "8%"; null → "—". */
function formatCommission(percent: number | null): string {
  if (percent == null) return "—";
  return `${percent}%`;
}

export function AgencyProfileForm({
  dict,
  feedback,
  profile,
}: {
  dict: Dictionary["account"]["profile"];
  feedback: Dictionary["account"]["feedback"];
  profile: AgencyProfile;
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(profile));
  // Admin-managed values, shown read-only for transparency.
  const readonly = profile.agency;
  const [status, setStatus] = useState<Status>("idle");

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "saving") return;
    setStatus("saving");
    try {
      const res = await fetch("/api/agency/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            locale: form.locale,
          },
          agency: {
            legal_name: form.legal_name,
            display_name: form.display_name,
            address_street: form.address_street,
            address_street_number: form.address_street_number,
            postal_code: form.postal_code,
            city: form.city,
            country_alpha2: form.country_alpha2,
            phone_prefix: form.phone_prefix,
            phone: form.company_phone,
            email: form.company_email,
            website: form.website,
            facebook_url: form.facebook_url.trim() === "" ? null : form.facebook_url,
            tripadvisor_url: form.tripadvisor_url.trim() === "" ? null : form.tripadvisor_url,
            description: form.description,
            collaboration_reason: form.collaboration_reason,
          },
        }),
      });
      const data = (await res.json()) as { ok?: boolean; profile?: AgencyProfile };
      if (!res.ok || !data.ok || !data.profile) throw new Error("failed");
      setForm(toFormState(data.profile));
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Login account (user) */}
      <fieldset className="rounded-[15px] border border-soft-grey bg-white p-6 sm:p-8">
        <legend className="px-2 text-lg font-extrabold text-ink">{dict.userTitle}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField id="name" label={dict.name} value={form.name} onChange={set("name")} autoComplete="name" />
          </div>
          <TextField id="email" type="email" label={dict.email} value={form.email} onChange={set("email")} autoComplete="email" />
          <TextField id="phone" type="tel" label={dict.phone} value={form.phone} onChange={set("phone")} autoComplete="tel" />
          <div>
            <label htmlFor="locale" className={labelClass}>
              {dict.locale}
            </label>
            <select id="locale" name="locale" value={form.locale} onChange={set("locale")} className={fieldInputClass}>
              {locales.map((loc) => (
                <option key={loc} value={loc}>
                  {LOCALE_LABELS[loc]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Company data */}
      <fieldset className="rounded-[15px] border border-soft-grey bg-white p-6 sm:p-8">
        <legend className="px-2 text-lg font-extrabold text-ink">{dict.companyTitle}</legend>

        {/* Admin-managed values (read-only) */}
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField id="agency_code" label={dict.agencyCode} value={readonly.code ?? "—"} disabled readOnly />
          <TextField id="commission" label={dict.commission} value={formatCommission(readonly.commission_percent)} disabled readOnly />
          <TextField id="api_enabled" label={dict.apiEnabled} value={readonly.api_enabled ? "✓" : "—"} disabled readOnly />
        </div>
        <p className="mt-2 text-xs text-ink/60">{dict.readonlyNote}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <TextField id="legal_name" label={dict.legalName} value={form.legal_name} onChange={set("legal_name")} />
          <TextField id="display_name" label={dict.displayName} value={form.display_name} onChange={set("display_name")} />
          <div className="grid gap-4 sm:col-span-2 sm:grid-cols-[1fr_120px]">
            <TextField id="address_street" label={dict.addressStreet} value={form.address_street} onChange={set("address_street")} autoComplete="address-line1" />
            <TextField id="address_street_number" label={dict.addressStreetNumber} value={form.address_street_number} onChange={set("address_street_number")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            <TextField id="postal_code" label={dict.postalCode} value={form.postal_code} onChange={set("postal_code")} autoComplete="postal-code" />
            <TextField id="city" label={dict.city} value={form.city} onChange={set("city")} autoComplete="address-level2" />
          </div>
          {/* ISO 3166-1 alpha-2 (e.g. "ES"); the backend owns the country table. */}
          <TextField id="country_alpha2" label={dict.country} value={form.country_alpha2} onChange={set("country_alpha2")} maxLength={2} autoComplete="country" />
          <div className="grid gap-4 sm:col-span-2 sm:grid-cols-[120px_1fr]">
            <TextField id="phone_prefix" label={dict.phonePrefix} value={form.phone_prefix} onChange={set("phone_prefix")} autoComplete="tel-country-code" />
            <TextField id="company_phone" type="tel" label={dict.companyPhone} value={form.company_phone} onChange={set("company_phone")} autoComplete="tel-national" />
          </div>
          <TextField id="company_email" type="email" label={dict.companyEmail} value={form.company_email} onChange={set("company_email")} />
          <TextField id="website" type="url" label={dict.website} value={form.website} onChange={set("website")} autoComplete="url" />
          <TextField id="facebook_url" type="url" label={dict.facebookUrl} value={form.facebook_url} onChange={set("facebook_url")} />
          <TextField id="tripadvisor_url" type="url" label={dict.tripadvisorUrl} value={form.tripadvisor_url} onChange={set("tripadvisor_url")} />
          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelClass}>
              {dict.description}
            </label>
            <textarea id="description" name="description" value={form.description} onChange={set("description")} rows={3} className={`${fieldInputClass} resize-y`} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="collaboration_reason" className={labelClass}>
              {dict.collaborationReason}
            </label>
            <textarea id="collaboration_reason" name="collaboration_reason" value={form.collaboration_reason} onChange={set("collaboration_reason")} rows={3} className={`${fieldInputClass} resize-y`} />
          </div>
        </div>
      </fieldset>

      {status === "saved" ? <Flash variant="success">{feedback.saved}</Flash> : null}
      {status === "error" ? <Flash variant="error">{feedback.error}</Flash> : null}

      <div className="sm:max-w-[260px]">
        <SubmitButton loading={status === "saving"} loadingLabel={feedback.loading}>
          {dict.save}
        </SubmitButton>
      </div>
    </form>
  );
}

/** Controlled text input matching the design-system field. */
function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  disabled,
  readOnly,
  maxLength,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className={fieldInputClass}
      />
    </div>
  );
}
