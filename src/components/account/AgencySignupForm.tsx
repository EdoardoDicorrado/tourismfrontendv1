"use client";

import Link from "next/link";
import { useState } from "react";

import { fieldInputClass, Flash, SubmitButton } from "@/components/account/ui";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type SignupError = "emailTaken" | "generic" | null;

type SignupDict = Dictionary["account"]["agencySignup"];

/** Country options (ISO 3166-1 alpha-2) for the LATAM/ES market — proper nouns, no i18n. */
const COUNTRY_OPTIONS: { value: string; label: string }[] = [
  { value: "IT", label: "Italia" },
  { value: "ES", label: "España" },
  { value: "MX", label: "México" },
  { value: "AR", label: "Argentina" },
];

/** Field label + bare controlled input (matching the design-system field). */
function Input({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-bold text-ink">
        {label}
        {required ? <span className="text-badge"> *</span> : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={fieldInputClass}
      />
    </div>
  );
}

/** True when a Laravel-style validation `details` object flags an email field. */
function isEmailValidation(details: unknown): boolean {
  if (!details || typeof details !== "object") return false;
  return Object.keys(details as Record<string, unknown>).some((k) => /email/i.test(k));
}

/**
 * Agency registration form. Two sections (company data + login account). Submits
 * to the `/api/auth/agency/signup` BFF; on success the parent page swaps to the
 * "pending activation" state via `onSuccess` — no session is created (the account
 * must be activated by staff first).
 *
 * Payload mirrors the backend 1:1 (nested English): `agency.{legal_name, …,
 * billing:{vat_id, tax_code}}` + `user.{name, email, …}`. Country is an ISO
 * alpha-2 select (the backend owns the country table). A backend `422`
 * (duplicate email / weak password / bad code) surfaces as `validation_failed`;
 * an email-keyed detail maps to the "already registered" message.
 */
export function AgencySignupForm({
  lang,
  dict,
  onSuccess,
}: {
  lang: Locale;
  dict: SignupDict;
  onSuccess: () => void;
}) {
  // Company
  const [legalName, setLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [vatId, setVatId] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressStreetNumber, setAddressStreetNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [countryAlpha2, setCountryAlpha2] = useState("IT");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+39");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [tripadvisorUrl, setTripadvisorUrl] = useState("");
  const [collaborationReason, setCollaborationReason] = useState("");

  // User (login account)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [policyCheck, setPolicyCheck] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<SignupError>(null);
  // Client-side validation message, surfaced via dedicated dict keys so the three
  // distinct failures (email/password mismatch, missing policy) are distinguishable.
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setLocalError(null);

    if (email !== emailConfirm) {
      setLocalError(dict.emailMismatch);
      return;
    }
    if (password !== passwordConfirm) {
      setLocalError(dict.passwordMismatch);
      return;
    }
    if (!policyCheck) {
      setLocalError(dict.policyRequired);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/agency/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agency: {
            legal_name: legalName,
            display_name: displayName || null,
            address_street: addressStreet,
            address_street_number: addressStreetNumber,
            postal_code: postalCode,
            city,
            country_alpha2: countryAlpha2,
            email: agencyEmail,
            phone_prefix: phonePrefix,
            phone,
            website: website || null,
            facebook_url: facebookUrl || null,
            tripadvisor_url: tripadvisorUrl || null,
            collaboration_reason: collaborationReason,
            billing: {
              vat_id: vatId || null,
              tax_code: taxCode || null,
            },
          },
          user: {
            name,
            email,
            email_confirm: emailConfirm,
            password,
            password_confirm: passwordConfirm,
            policy_check: policyCheck,
          },
          locale: lang,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; details?: unknown };
      if (res.ok && data.ok) {
        onSuccess();
        return;
      }
      if (data.error === "validation_failed" && isEmailValidation(data.details)) {
        setError("emailTaken");
      } else {
        setError("generic");
      }
    } catch {
      setError("generic");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
      {/* ── Company section ── */}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-extrabold text-ink">{dict.sectionCompany}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="legal_name" label={dict.legalName} value={legalName} onChange={setLegalName} required />
          <Input id="display_name" label={dict.displayName} value={displayName} onChange={setDisplayName} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="vat_id" label={dict.vatId} value={vatId} onChange={setVatId} />
          <Input id="tax_code" label={dict.taxCode} value={taxCode} onChange={setTaxCode} />
        </div>
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <Input id="address_street" label={dict.addressStreet} value={addressStreet} onChange={setAddressStreet} required />
          <Input id="address_street_number" label={dict.addressStreetNumber} value={addressStreetNumber} onChange={setAddressStreetNumber} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input id="postal_code" label={dict.postalCode} value={postalCode} onChange={setPostalCode} required />
          <Input id="city" label={dict.city} value={city} onChange={setCity} required />
          <div>
            <label htmlFor="country_alpha2" className="mb-1 block text-sm font-bold text-ink">
              {dict.country}
              <span className="text-badge"> *</span>
            </label>
            <select
              id="country_alpha2"
              value={countryAlpha2}
              onChange={(e) => setCountryAlpha2(e.target.value)}
              className={fieldInputClass}
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Input id="agency_email" label={dict.agencyEmail} type="email" value={agencyEmail} onChange={setAgencyEmail} required />
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <Input id="phone_prefix" label={dict.phonePrefix} value={phonePrefix} onChange={setPhonePrefix} required />
          <Input id="phone" label={dict.phone} value={phone} onChange={setPhone} required />
        </div>
        <Input id="website" label={dict.website} value={website} onChange={setWebsite} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="facebook_url" label={dict.facebookUrl} value={facebookUrl} onChange={setFacebookUrl} />
          <Input id="tripadvisor_url" label={dict.tripadvisorUrl} value={tripadvisorUrl} onChange={setTripadvisorUrl} />
        </div>
        <div>
          <label htmlFor="collaboration_reason" className="mb-1 block text-sm font-bold text-ink">
            {dict.collaborationReason}
            <span className="text-badge"> *</span>
          </label>
          <textarea
            id="collaboration_reason"
            value={collaborationReason}
            onChange={(e) => setCollaborationReason(e.target.value)}
            required
            rows={3}
            className={`${fieldInputClass} resize-y`}
          />
        </div>
      </fieldset>

      {/* ── User section (login account) ── */}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-lg font-extrabold text-ink">{dict.sectionUser}</legend>
        <Input id="name" label={dict.name} value={name} onChange={setName} required autoComplete="name" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="user_email" label={dict.email} type="email" value={email} onChange={setEmail} required autoComplete="email" />
          <Input id="email_confirm" label={dict.emailConfirm} type="email" value={emailConfirm} onChange={setEmailConfirm} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="password" label={dict.password} type="password" value={password} onChange={setPassword} required autoComplete="new-password" />
          <Input id="password_confirm" label={dict.passwordConfirm} type="password" value={passwordConfirm} onChange={setPasswordConfirm} required autoComplete="new-password" />
        </div>
        <label className="flex items-start gap-2 text-sm text-ink/80">
          <input
            type="checkbox"
            checked={policyCheck}
            onChange={(e) => setPolicyCheck(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-cta"
          />
          <span>{dict.policyCheck}</span>
        </label>
      </fieldset>

      {localError && <Flash variant="error">{localError}</Flash>}
      {error === "emailTaken" && <Flash variant="error">{dict.emailTaken}</Flash>}
      {error === "generic" && <Flash variant="error">{dict.error}</Flash>}

      <SubmitButton loading={submitting} loadingLabel={dict.submitting}>
        {dict.submit}
      </SubmitButton>

      <p className="text-center text-sm text-ink/70">
        <Link href={`/${lang}/agenzie/accedi`} className="font-bold text-cta hover:underline">
          {dict.backToLogin}
        </Link>
      </p>
    </form>
  );
}
