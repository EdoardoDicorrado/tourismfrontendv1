"use client";

import Image from "next/image";
import { useState } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Popover } from "@/components/ui/Popover";
import { Flash } from "@/components/account/ui";
import { fill, type Locale } from "@/lib/i18n/config";
import type { AffiliatesCopy } from "@/lib/i18n/dictionaries/affiliates";

type Step = 1 | 2 | "done";

const ctaButton =
  "flex w-full items-center justify-center rounded-card bg-cta py-4 text-base font-bold text-white transition-colors hover:bg-cta-hover active:bg-cta-active disabled:opacity-60";

const controlClass =
  "w-full border-0 bg-transparent p-0 text-base font-medium leading-[22px] text-ink outline-none placeholder:text-ink/40";

/** Bordered "floating label" field (cta border / cta label / ink value). */
function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-1 rounded-card border border-cta p-2">
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-xs font-bold text-cta">
        <span>{label}</span>
        {hint && <span className="font-medium text-cta/70">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

/**
 * Affiliate request — a 2-step PAGE (not a modal), mirroring the agencies signup
 * flow. Step 1 collects the contact details, step 2 the channels + project, then a
 * confirmation. Submission is a UI PREVIEW until the partner API exists (deposited
 * to full-stack). React Compiler is ON: state writes happen in event handlers only.
 */
export function AffiliateRequestForm({ lang, t }: { lang: Locale; t: AffiliatesCopy }) {
  const f = t.form;
  const [step, setStep] = useState<Step>(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [profile, setProfile] = useState("");
  const [audienceSize, setAudienceSize] = useState("");
  const [project, setProject] = useState("");
  const [gdpr, setGdpr] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function emailValid(v: string) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
  }

  function submitStep1(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setError(f.errorRequired);
      return;
    }
    if (!emailValid(email)) {
      setError(f.errorEmail);
      return;
    }
    setStep(2);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitStep2(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!website.trim() && !instagram.trim() && !tiktok.trim() && !youtube.trim()) {
      setError(f.errorRequired);
      return;
    }
    if (!profile || !project.trim()) {
      setError(f.errorRequired);
      return;
    }
    if (!gdpr) {
      setError(f.errorGdpr);
      return;
    }
    setSubmitting(true);
    // TODO(full-stack): POST the affiliate request to the partner API.
    setSubmitting(false);
    setStep("done");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (step === "done") {
    return (
      <section className="py-8">
        <Container className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-[77px] shrink-0 items-center justify-center rounded-full bg-ink">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h1 className="text-2xl font-extrabold text-ink">{f.successTitle}</h1>
          <p className="text-base text-ink">{f.successBody}</p>
          <ButtonLink href={`/${lang}/partner/affiliati`} size="lg" fullWidth>
            {f.successCta}
          </ButtonLink>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-8">
      <Container className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 text-ink">
          <h1 className="text-2xl font-extrabold leading-tight">{f.title}</h1>
          <p className="text-sm font-semibold text-cta">
            {fill(f.stepOf, { n: String(step) })} · {step === 1 ? f.step1Title : f.step2Title}
          </p>
          <p className="text-base">{f.subtitle}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={submitStep1} className="flex flex-col gap-4" noValidate>
            <Field id="aff-first" label={f.firstName}>
              <input id="aff-first" className={controlClass} autoComplete="given-name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </Field>
            <Field id="aff-last" label={f.lastName}>
              <input id="aff-last" className={controlClass} autoComplete="family-name" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Field>
            <Field id="aff-email" label={f.email}>
              <input id="aff-email" type="email" className={controlClass} autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field id="aff-phone" label={f.phone}>
              <input id="aff-phone" type="tel" className={controlClass} autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            {error && <Flash variant="error">{error}</Flash>}
            <button type="submit" className={ctaButton}>{f.continue}</button>
          </form>
        ) : (
          <form onSubmit={submitStep2} className="flex flex-col gap-4" noValidate>
            <Field id="aff-website" label={f.website} hint={f.optionalHint}>
              <input id="aff-website" type="url" inputMode="url" className={controlClass} placeholder={f.websitePlaceholder} value={website} onChange={(e) => setWebsite(e.target.value)} />
            </Field>
            <Field id="aff-instagram" label={f.instagram} hint={f.optionalHint}>
              <input id="aff-instagram" className={controlClass} placeholder={f.handlePlaceholder} value={instagram} onChange={(e) => setInstagram(e.target.value)} />
            </Field>
            <Field id="aff-tiktok" label={f.tiktok} hint={f.optionalHint}>
              <input id="aff-tiktok" className={controlClass} placeholder={f.handlePlaceholder} value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
            </Field>
            <Field id="aff-youtube" label={f.youtube} hint={f.optionalHint}>
              <input id="aff-youtube" className={controlClass} placeholder={f.handlePlaceholder} value={youtube} onChange={(e) => setYoutube(e.target.value)} />
            </Field>
            <Field id="aff-profile" label={f.profileType}>
              <Popover
                animated
                align="stretch"
                className="relative w-full"
                panelClassName="overflow-hidden rounded-xl border border-soft-grey bg-white py-1 text-ink shadow-lg"
                trigger={({ open, toggle, id }) => (
                  <button
                    type="button"
                    id="aff-profile"
                    onClick={toggle}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-controls={id}
                    className={`${controlClass} flex items-center justify-between gap-2 text-left`}
                  >
                    <span className={profile ? "text-ink" : "text-ink/40"}>
                      {profile || f.profilePlaceholder}
                    </span>
                    <Image
                      src="/images/icon-chevron-down.svg"
                      alt=""
                      width={16}
                      height={10}
                      className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              >
                {({ close }) => (
                  <ul role="listbox">
                    {f.profileOptions.map((opt) => {
                      const active = opt === profile;
                      return (
                        <li key={opt} role="none">
                          <button
                            type="button"
                            role="option"
                            aria-selected={active}
                            onClick={() => {
                              setProfile(opt);
                              close();
                            }}
                            className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-sm hover:bg-soft ${
                              active ? "font-bold text-cta" : "font-medium text-ink"
                            }`}
                          >
                            <span>{opt}</span>
                            {active && (
                              <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
                                <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Popover>
            </Field>
            <Field id="aff-audience" label={f.audienceSize} hint={f.optionalHint}>
              <input id="aff-audience" className={controlClass} value={audienceSize} onChange={(e) => setAudienceSize(e.target.value)} />
            </Field>
            <Field id="aff-project" label={f.project}>
              <textarea id="aff-project" rows={4} className={`${controlClass} resize-none`} placeholder={f.projectPlaceholder} required value={project} onChange={(e) => setProject(e.target.value)} />
            </Field>

            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={gdpr} disabled={submitting} onChange={(e) => setGdpr(e.target.checked)} className="peer sr-only" />
              <span className="flex size-7 shrink-0 items-center justify-center rounded-card border border-cta text-white peer-checked:bg-cta peer-focus-visible:ring-2 peer-focus-visible:ring-cta/40">
                {gdpr && (
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
                    <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-base text-ink">{f.gdpr}</span>
            </label>

            {error && <Flash variant="error">{error}</Flash>}

            <button type="submit" disabled={submitting} className={ctaButton}>
              {submitting ? f.submitting : f.submit}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep(1);
              }}
              disabled={submitting}
              className="text-sm font-semibold text-cta hover:underline disabled:opacity-60"
            >
              {f.back}
            </button>
          </form>
        )}
      </Container>
    </section>
  );
}
