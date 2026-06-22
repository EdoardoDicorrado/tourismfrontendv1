"use client";

import { useState } from "react";

import { PhonePrefixSelect } from "@/components/checkout/CountrySelects";
import { Button, ButtonLink } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";

/**
 * Agency partnership application — 2-step wizard + confirmation (Figma "Modulo //
 * Mobile" 447:3087 / 447:3252 / 447:3434). This is a LEAD/candidatura (no
 * email/password, no account): an operator follows up after submission.
 *
 * PREVIEW (ui-ux): strings hardcoded IT for this first pass (i18n → marketing);
 * submit is a preview that shows the confirmation — there is no application
 * endpoint yet (deposited to full-stack: the existing /auth/agency/signup expects
 * a full account, a different shape).
 */
const PRIVACY_NOTE =
  "INFORMATIVA PRIVACY RICERCA E SELEZIONE DEL PERSONALE AI SENSI DEL REGOLAMENTO 2016/679/UE “REGOLAMENTO EUROPEO IN MATERIA DI PROTEZIONE DEI DATI PERSONALI” ARTICOLI 13 E SEGUENTI";

/** Bordered floating-label field (Figma checkout/modulo style: cta when filled/focused). */
function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  inputMode,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  inputMode?: "text" | "numeric" | "tel" | "email";
  autoComplete?: string;
}) {
  const filled = value.length > 0;
  return (
    <div
      className={`group flex w-full flex-col gap-1 rounded-card border p-2 transition-colors focus-within:border-cta ${
        filled ? "border-cta" : "border-ink"
      }`}
    >
      <label
        htmlFor={id}
        className={`text-xs font-bold transition-colors group-focus-within:text-cta ${
          filled ? "text-cta" : "text-ink"
        }`}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent p-0 text-base font-medium leading-[22px] text-ink outline-none placeholder:text-ink/40"
      />
    </div>
  );
}

export function AgencyApplyWizard({ lang }: { lang: Locale }) {
  const [step, setStep] = useState<1 | 2 | "done">(1);

  // Step 1 — agency
  const [agencyName, setAgencyName] = useState("");
  const [vat, setVat] = useState("");
  const [city, setCity] = useState("");

  // Step 2 — referente
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("IT");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [gdpr, setGdpr] = useState(false);

  function submitStep1(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitStep2(e: React.FormEvent) {
    e.preventDefault();
    // POST the lead to the apply BFF. PREVIEW: the route accepts it (the staff
    // notification is backend-side), and we show the confirmation regardless so the
    // flow works without a backend; gate on `ok` once the lead endpoint is live.
    try {
      await fetch("/api/agency/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName,
          vat,
          city,
          firstName,
          lastName,
          country,
          phone,
          message,
          gdpr,
          locale: lang,
        }),
      });
    } catch {
      /* network → still confirm in preview */
    }
    setStep("done");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (step === "done") {
    return (
      <div className="mx-auto flex max-w-[520px] flex-col items-center gap-4 py-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-ink text-white">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h1 className="text-2xl font-extrabold text-ink">Richiesta inoltrata</h1>
        <p className="text-base font-medium text-ink/70">
          L’invio della tua candidatura è andato a buon fine. Verrai presto ricontattato da uno dei
          nostri operatori.
        </p>
        <div className="mt-2 flex w-full flex-col gap-4 rounded-[10px] bg-soft p-4">
          <p className="text-sm font-medium text-ink">
            In Tourismotion crediamo che la qualità dell’esperienza offerta ai nostri clienti nasca
            dalle persone che fanno parte del nostro team: scopri chi siamo.
          </p>
          <ButtonLink href={`/${lang}/chi-siamo`} size="lg" fullWidth>
            Chi siamo
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[520px]">
      <h1 className="text-2xl font-extrabold leading-tight text-ink">
        Candidatura – Step {step}
        <br />
        Agenzie di viaggio
      </h1>
      <p className="mt-2 text-base font-medium text-ink/70">
        Compila tutti i campi con i dati richiesti.
      </p>

      {step === 1 ? (
        <form onSubmit={submitStep1} className="mt-6 flex flex-col gap-4">
          <p className="text-base font-bold text-ink">La tua agenzia</p>
          <Field
            id="agency-name"
            label="Nome agenzia"
            value={agencyName}
            onChange={setAgencyName}
            placeholder="Rossi Viaggi"
            required
            autoComplete="organization"
          />
          <Field
            id="agency-vat"
            label="Partita IVA"
            value={vat}
            onChange={setVat}
            placeholder="IT05922611867"
            required
          />
          <Field
            id="agency-city"
            label="Città"
            value={city}
            onChange={setCity}
            placeholder="Milano"
            required
            autoComplete="address-level2"
          />
          <Button type="submit" variant="primary" size="lg" fullWidth className="mt-2">
            Continua
          </Button>
        </form>
      ) : (
        <form onSubmit={submitStep2} className="mt-6 flex flex-col gap-4">
          <p className="text-base font-bold text-ink">Il referente</p>
          <Field
            id="ref-first"
            label="Nome"
            value={firstName}
            onChange={setFirstName}
            placeholder="Mario"
            required
            autoComplete="given-name"
          />
          <Field
            id="ref-last"
            label="Cognome"
            value={lastName}
            onChange={setLastName}
            placeholder="Rossi"
            required
            autoComplete="family-name"
          />

          {/* Telefono con prefisso paese (riusa il selettore del checkout) */}
          <div className="group flex w-full flex-col gap-1 rounded-card border border-ink p-2 transition-colors focus-within:border-cta">
            <label htmlFor="ref-phone" className="text-xs font-bold text-ink group-focus-within:text-cta">
              Telefono
            </label>
            <div className="flex items-center gap-3">
              <PhonePrefixSelect
                value={country}
                onChange={setCountry}
                lang={lang}
                searchPlaceholder="Cerca paese o prefisso"
                noResults="Nessun risultato"
              />
              <input
                id="ref-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="323 8383023"
                className="w-full flex-1 border-0 bg-transparent p-0 text-base font-medium leading-[22px] text-ink outline-none placeholder:text-ink/40"
              />
            </div>
          </div>

          {/* Messaggio */}
          <div
            className={`group flex w-full flex-col gap-1 rounded-card border p-2 transition-colors focus-within:border-cta ${
              message.length > 0 ? "border-cta" : "border-ink"
            }`}
          >
            <label
              htmlFor="ref-message"
              className={`text-xs font-bold transition-colors group-focus-within:text-cta ${
                message.length > 0 ? "text-cta" : "text-ink"
              }`}
            >
              Messaggio
            </label>
            <textarea
              id="ref-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Raccontaci brevemente la tua agenzia o dici cosa ti aspetti dalla partnership…"
              className="w-full resize-none border-0 bg-transparent p-0 text-base font-medium leading-[22px] text-ink outline-none placeholder:text-ink/40"
            />
          </div>

          <p className="text-[11px] font-semibold uppercase leading-snug text-ink/50">
            {PRIVACY_NOTE}
          </p>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              required
              checked={gdpr}
              onChange={(e) => setGdpr(e.target.checked)}
              className="peer sr-only"
            />
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-card border border-cta text-white peer-checked:bg-cta peer-focus-visible:ring-2 peer-focus-visible:ring-cta/40">
              {gdpr && (
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
                  <path
                    d="M3.5 8.5l3 3 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className="text-sm text-ink">
              Ho letto e accetto il trattamento dei dati personali (GDPR).
            </span>
          </label>

          <Button type="submit" variant="primary" size="lg" fullWidth className="mt-2">
            Invia richiesta
          </Button>
        </form>
      )}
    </div>
  );
}
