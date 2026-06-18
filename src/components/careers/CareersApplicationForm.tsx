"use client";

import { useRef, useState } from "react";

import { fieldInputClass, Flash, SubmitButton } from "@/components/account/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Step = 1 | 2 | "done";

const PHONE_PREFIXES = ["+39", "+34", "+44", "+1", "+49", "+33", "+351"];
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = /\.(pdf|docx?)$/i;
const FILE_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

/** Dashed upload field — label, hint and the selected file (with a remove action). */
function FileField({
  id,
  label,
  hint,
  file,
  onSelect,
  uploadCta,
  changeLabel,
  removeLabel,
  disabled,
}: {
  id: string;
  label: string;
  hint: string;
  file: File | null;
  onSelect: (file: File | null) => void;
  uploadCta: string;
  changeLabel: string;
  removeLabel: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-[10px] border border-dashed border-cta/60 bg-white p-4">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={FILE_ACCEPT}
        disabled={disabled}
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
        className="hidden"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-cta">{label}</p>
          {file ? (
            <p className="mt-0.5 truncate text-sm text-ink">{file.name}</p>
          ) : (
            <p className="mt-0.5 text-xs text-ink/60">{hint}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {file && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                if (inputRef.current) inputRef.current.value = "";
                onSelect(null);
              }}
              className="text-sm font-semibold text-badge hover:underline disabled:opacity-60"
            >
              {removeLabel}
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="rounded-[8px] border border-cta px-3 py-1.5 text-sm font-bold text-cta transition-colors hover:bg-cta hover:text-white disabled:opacity-60"
          >
            {file ? changeLabel : uploadCta}
          </button>
        </div>
      </div>
    </div>
  );
}

/** A submitted-application snapshot, rendered in the confirmation recap. */
type Recap = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  residence: string;
  domicile: string;
  cvName: string;
  coverName: string;
  reference: string;
};

/**
 * Multi-step "Lavora con noi" application form. Figma nodes 447:1834 (step 1 —
 * personal data), 447:2014 (step 2 — documents) and 447:2191 (confirmation).
 *
 * Submits multipart/form-data to the `/api/careers/apply` BFF (the public careers
 * API is not defined yet, so that route is a validated stub). React Compiler is
 * ON: every state write here happens in an event handler, never in an effect.
 */
export function CareersApplicationForm({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["careers"];
}) {
  const t = dict.form;

  const [step, setStep] = useState<Step>(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState(PHONE_PREFIXES[0]);
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [residence, setResidence] = useState("");
  const [domicile, setDomicile] = useState("");

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [gdpr, setGdpr] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recap, setRecap] = useState<Recap | null>(null);

  function emailValid(value: string): boolean {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());
  }

  function fileValid(file: File): boolean {
    return file.size <= MAX_FILE_BYTES && ALLOWED_EXT.test(file.name);
  }

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !birthDate.trim() ||
      !residence.trim()
    ) {
      setError(t.errorRequired);
      return;
    }
    if (!emailValid(email)) {
      setError(t.errorEmail);
      return;
    }
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!cvFile) {
      setError(t.errorCv);
      return;
    }
    if (!fileValid(cvFile)) {
      setError(ALLOWED_EXT.test(cvFile.name) ? t.errorFileSize : t.errorFileType);
      return;
    }
    if (coverFile && !fileValid(coverFile)) {
      setError(ALLOWED_EXT.test(coverFile.name) ? t.errorFileSize : t.errorFileType);
      return;
    }
    if (!gdpr) {
      setError(t.errorGdpr);
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.set("first_name", firstName.trim());
      body.set("last_name", lastName.trim());
      body.set("email", email.trim());
      body.set("phone", `${phonePrefix} ${phone.trim()}`.trim());
      body.set("birth_date", birthDate);
      body.set("residence_address", residence.trim());
      if (domicile.trim()) body.set("domicile_address", domicile.trim());
      body.set("cv", cvFile);
      if (coverFile) body.set("cover_letter", coverFile);
      body.set("gdpr_consent", "true");
      body.set("locale", lang);

      const res = await fetch("/api/careers/apply", { method: "POST", body });
      const data = (await res.json()) as { ok?: boolean; reference?: string };
      if (res.ok && data.ok) {
        setRecap({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: `${phonePrefix} ${phone.trim()}`.trim(),
          birthDate,
          residence: residence.trim(),
          domicile: domicile.trim(),
          cvName: cvFile.name,
          coverName: coverFile?.name ?? "",
          reference: data.reference ?? "",
        });
        setStep("done");
        return;
      }
      setError(t.errorSubmit);
    } catch {
      setError(t.errorSubmit);
    }
    setSubmitting(false);
  }

  if (step === "done" && recap) {
    return <Confirmation lang={lang} dict={dict} recap={recap} />;
  }

  return (
    <section id="modulo" className="scroll-mt-8 bg-soft/40 py-12 sm:py-16">
      <Container className="flex justify-center">
        <div className="w-full max-w-[560px] rounded-[15px] border border-soft-grey bg-white p-6 sm:p-8">
          <p className="text-sm font-semibold text-cta">{fill(t.stepOf, { n: step, total: 2 })}</p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink sm:text-3xl">{t.title}</h2>
          <p className="text-lg font-bold text-ink">
            {step === 1 ? t.step1Subtitle : t.step2Subtitle}
          </p>
          <p className="mt-2 text-sm text-ink/70">{t.intro}</p>

          {step === 1 ? (
            <form onSubmit={handleContinue} className="mt-6 flex flex-col gap-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Labelled id="cv-first-name" label={t.firstName}>
                  <input
                    id="cv-first-name"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={fieldInputClass}
                  />
                </Labelled>
                <Labelled id="cv-last-name" label={t.lastName}>
                  <input
                    id="cv-last-name"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={fieldInputClass}
                  />
                </Labelled>
              </div>

              <Labelled id="cv-email" label={t.email}>
                <input
                  id="cv-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldInputClass}
                />
              </Labelled>

              <div>
                <label htmlFor="cv-phone" className="mb-1 block text-sm font-bold text-ink">
                  {t.phone}
                </label>
                <div className="flex gap-2">
                  <div className="w-28 shrink-0">
                    <select
                      aria-label={t.phonePrefix}
                      value={phonePrefix}
                      onChange={(e) => setPhonePrefix(e.target.value)}
                      className={fieldInputClass}
                    >
                      {PHONE_PREFIXES.map((prefix) => (
                        <option key={prefix} value={prefix}>
                          {prefix}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    id="cv-phone"
                    type="tel"
                    autoComplete="tel-national"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`${fieldInputClass} min-w-0 flex-1`}
                  />
                </div>
              </div>

              <Labelled id="cv-birth-date" label={t.birthDate}>
                <input
                  id="cv-birth-date"
                  type="date"
                  autoComplete="bday"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className={fieldInputClass}
                />
              </Labelled>

              <Labelled id="cv-residence" label={t.residence}>
                <input
                  id="cv-residence"
                  type="text"
                  autoComplete="street-address"
                  required
                  value={residence}
                  onChange={(e) => setResidence(e.target.value)}
                  className={fieldInputClass}
                />
              </Labelled>

              <Labelled id="cv-domicile" label={t.domicile}>
                <input
                  id="cv-domicile"
                  type="text"
                  value={domicile}
                  onChange={(e) => setDomicile(e.target.value)}
                  className={fieldInputClass}
                />
              </Labelled>

              {error && <Flash variant="error">{error}</Flash>}

              <SubmitButton>{t.continue}</SubmitButton>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
              <FileField
                id="cv-file"
                label={t.cv}
                hint={t.cvHint}
                file={cvFile}
                onSelect={setCvFile}
                uploadCta={t.uploadCta}
                changeLabel={t.changeFile}
                removeLabel={t.removeFile}
                disabled={submitting}
              />
              <FileField
                id="cover-file"
                label={t.coverLetter}
                hint={t.coverLetterHint}
                file={coverFile}
                onSelect={setCoverFile}
                uploadCta={t.uploadCta}
                changeLabel={t.changeFile}
                removeLabel={t.removeFile}
                disabled={submitting}
              />

              <p className="text-xs uppercase leading-relaxed text-ink/60">{t.privacyNotice}</p>

              <label className="flex items-start gap-2 text-sm text-ink/80">
                <input
                  type="checkbox"
                  checked={gdpr}
                  onChange={(e) => setGdpr(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-cta"
                />
                <span>{t.gdpr}</span>
              </label>

              {error && <Flash variant="error">{error}</Flash>}

              <SubmitButton loading={submitting} loadingLabel={t.submitting}>
                {t.submit}
              </SubmitButton>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
                disabled={submitting}
                className="text-sm font-semibold text-cta hover:underline disabled:opacity-60"
              >
                {t.back}
              </button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}

/** Label + control wrapper matching the account-form field look. */
function Labelled({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-bold text-ink">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Confirmation screen — check mark, recap of the submitted data, "about us" card. */
function Confirmation({
  lang,
  dict,
  recap,
}: {
  lang: Locale;
  dict: Dictionary["careers"];
  recap: Recap;
}) {
  const t = dict.success;
  const f = dict.form;

  const rows: Array<[string, string]> = [
    [f.firstName, recap.firstName],
    [f.lastName, recap.lastName],
    [f.email, recap.email],
    [f.phone, recap.phone],
    [f.birthDate, recap.birthDate],
    [f.residence, recap.residence],
    [f.domicile, recap.domicile],
    [f.cv, recap.cvName],
    [f.coverLetter, recap.coverName],
  ];

  return (
    <section id="modulo" className="scroll-mt-8 bg-soft/40 py-12 sm:py-16">
      <Container className="flex justify-center">
        <div className="w-full max-w-[560px]">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.title}</h2>
            <p className="max-w-[420px] text-base text-ink/80">{t.subtitle}</p>
          </div>

          <div className="mt-8 rounded-[15px] border border-soft-grey bg-white p-6">
            <div className="flex items-center justify-between gap-3 border-b border-soft-grey pb-3">
              <h3 className="font-extrabold text-ink">{t.recapTitle}</h3>
              {recap.reference && (
                <span className="text-xs font-semibold text-ink/60">
                  {t.referenceLabel}: <span className="text-cta">{recap.reference}</span>
                </span>
              )}
            </div>
            <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {rows
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                      {label}
                    </dt>
                    <dd className="truncate text-sm font-medium text-ink">{value}</dd>
                  </div>
                ))}
            </dl>
          </div>

          <div className="mt-6 flex flex-col items-start gap-4 rounded-[15px] bg-soft p-6">
            <p className="text-base text-ink/90">{t.cardText}</p>
            <ButtonLink href={`/${lang}/chi-siamo`} size="md">
              {t.cardCta}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
