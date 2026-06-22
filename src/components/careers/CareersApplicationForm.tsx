"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { Flash } from "@/components/account/ui";
import { Container } from "@/components/ui/Container";
import { Popover } from "@/components/ui/Popover";
import { formatDateLong, monthLongNames, weekdayShortNames } from "@/lib/format";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Step = 1 | 2 | "done";

const PHONE_PREFIXES = ["+39", "+34", "+44", "+1", "+49", "+33", "+351"];
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = /\.(pdf|docx?)$/i;
const FILE_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const ctaButton =
  "flex w-full items-center justify-center rounded-card bg-cta py-4 text-base font-bold text-white transition-colors hover:bg-cta-hover active:bg-cta-active disabled:opacity-60";

/** Bordered "floating label" field — Figma "Modulo" (447:1844): cta border, cta label, ink value. */
function FloatingField({
  id,
  label,
  className = "",
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex w-full flex-col gap-1 rounded-card border border-cta p-2">
      <label htmlFor={id} className="text-xs font-bold text-cta">
        {label}
      </label>
      <input
        id={id}
        className={`w-full border-0 bg-transparent p-0 text-base font-medium leading-[22px] text-ink outline-none placeholder:text-ink/40 ${className}`}
        {...props}
      />
    </div>
  );
}

type FormDict = Dictionary["careers"]["form"];

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Birth-date field — replaces the native `<input type="date">` with a modern
 * year → month → day cascade picker in a bottom sheet (mobile-first). The value
 * stays an ISO `yyyy-mm-dd` string so the form/BFF payload is unchanged.
 */
function BirthDateField({
  id,
  label,
  value,
  onChange,
  lang,
  t,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (iso: string) => void;
  lang: Locale;
  t: FormDict;
}) {
  return (
    <Popover
      sheet
      label={label}
      trigger={({ open, toggle, id: panelId }) => (
        <div className="flex w-full flex-col gap-1 rounded-card border border-cta p-2">
          <span className="text-xs font-bold text-cta">{label}</span>
          <button
            id={id}
            type="button"
            onClick={toggle}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={panelId}
            className="w-full bg-transparent p-0 text-left text-base font-medium leading-[22px] outline-none"
          >
            {value ? (
              <span className="text-ink">{formatDateLong(value, lang)}</span>
            ) : (
              <span className="text-ink/40">{t.birthDatePlaceholder}</span>
            )}
          </button>
        </div>
      )}
    >
      {({ close }) => (
        <DobPicker
          value={value}
          lang={lang}
          t={t}
          onPick={(iso) => {
            onChange(iso);
            close();
          }}
          onClose={close}
        />
      )}
    </Popover>
  );
}

/** Cascade picker body: pick year, then month, then day. Caps at today (no future DOB). */
function DobPicker({
  value,
  lang,
  t,
  onPick,
  onClose,
}: {
  value: string;
  lang: Locale;
  t: FormDict;
  onPick: (iso: string) => void;
  onClose: () => void;
}) {
  // Sheet content only renders after the trigger click → client-only, so reading
  // "today" here can't cause an SSR/hydration mismatch.
  const today = new Date();
  const maxYear = today.getFullYear();
  const minYear = maxYear - 100;

  const init = value ? value.split("-").map(Number) : null;
  const [year, setYear] = useState<number | null>(init ? init[0] : null);
  const [month, setMonth] = useState<number | null>(init ? init[1] - 1 : null);
  const [mode, setMode] = useState<"year" | "month" | "day">(value ? "day" : "year");

  const months = monthLongNames(lang);
  const weekdays = weekdayShortNames(lang);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  const monthDisabled = (m: number) => year === maxYear && m > today.getMonth();
  const dayDisabled = (d: number) =>
    year === maxYear && month === today.getMonth() && d > today.getDate();
  const dayCount = year !== null && month !== null ? new Date(year, month + 1, 0).getDate() : 0;
  const lead = year !== null && month !== null ? (new Date(year, month, 1).getDay() + 6) % 7 : 0;

  const prompt =
    mode === "year" ? t.birthDateYear : mode === "month" ? t.birthDateMonth : t.birthDateDay;

  const chip = "rounded-badge bg-soft px-3 py-1 text-sm font-bold text-cta";
  const cell = "grid aspect-square place-items-center rounded-card text-base font-medium transition";

  return (
    <div className="flex max-h-[85vh] flex-col rounded-t-sheet bg-white">
      {/* Header (pt clears the sheet grabber) */}
      <div className="flex shrink-0 items-center gap-4 border-b border-soft-grey px-4 pb-2 pt-6">
        <p className="flex-1 text-[20px] font-extrabold text-cta">{t.birthDate}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.back}
          className="grid size-11 shrink-0 place-items-center rounded-full text-cta transition hover:bg-soft"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Breadcrumb: current step + tap a chip to revisit year/month */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 px-4 py-3">
        <span className="text-sm font-bold text-ink">{prompt}</span>
        {year !== null && mode !== "year" && (
          <button type="button" className={chip} onClick={() => setMode("year")}>
            {year}
          </button>
        )}
        {month !== null && mode === "day" && (
          <button type="button" className={chip} onClick={() => setMode("month")}>
            {months[month]}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        {mode === "year" && (
          <div className="grid grid-cols-4 gap-2">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setYear(y);
                  setMode("month");
                }}
                className={`${cell} ${y === year ? "bg-cta text-white" : "text-ink hover:bg-soft"}`}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        {mode === "month" && (
          <div className="grid grid-cols-3 gap-2">
            {months.map((name, m) => (
              <button
                key={name}
                type="button"
                disabled={monthDisabled(m)}
                onClick={() => {
                  setMonth(m);
                  setMode("day");
                }}
                className={`${cell} px-1 text-sm disabled:opacity-30 ${
                  m === month ? "bg-cta text-white" : "text-ink hover:bg-soft"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {mode === "day" && year !== null && month !== null && (
          <div>
            <div className="grid grid-cols-7 text-center text-xs font-bold text-ink/60">
              {weekdays.map((d, i) => (
                <span key={i} className="py-1">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: lead }, (_, i) => (
                <span key={`b-${i}`} aria-hidden />
              ))}
              {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => {
                const iso = `${year}-${pad2(month + 1)}-${pad2(d)}`;
                const isSel = iso === value;
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={dayDisabled(d)}
                    onClick={() => onPick(iso)}
                    className={`${cell} disabled:opacity-30 ${
                      isSel ? "bg-cta text-white" : "text-ink hover:bg-soft"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Dashed upload zone — Figma "Modulo" step 2 (447:2024): doc icon + label/hint, upload icon, whole box clickable. */
function FileField({
  id,
  label,
  hint,
  file,
  onSelect,
  removeLabel,
  disabled,
}: {
  id: string;
  label: string;
  hint: string;
  file: File | null;
  onSelect: (file: File | null) => void;
  removeLabel: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const openPicker = () => inputRef.current?.click();
  const remove = () => {
    if (inputRef.current) inputRef.current.value = "";
    onSelect(null);
  };
  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={FILE_ACCEPT}
        disabled={disabled}
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
        className="hidden"
      />
      {file ? (
        // Loaded state: solid azure box, big file name (label/hint gone), trash to remove.
        <div className="flex w-full items-center justify-between gap-4 rounded-card border border-cta bg-soft p-4 text-cta">
          <button
            type="button"
            disabled={disabled}
            onClick={openPicker}
            className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:opacity-60"
          >
            <DocIcon />
            <span className="min-w-0 truncate text-base font-bold">{file.name}</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={remove}
            aria-label={removeLabel}
            className="grid size-9 shrink-0 place-items-center rounded-full text-badge transition hover:bg-white disabled:opacity-60"
          >
            <TrashIcon />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={openPicker}
          className="flex w-full items-center justify-between gap-4 rounded-card border border-dashed border-cta p-4 text-left text-cta disabled:opacity-60"
        >
          <span className="flex min-w-0 items-center gap-2">
            <DocIcon />
            <span className="min-w-0">
              <span className="block text-xs font-bold">{label}</span>
              <span className="block truncate text-xs font-normal">{hint}</span>
            </span>
          </span>
          <UploadIcon />
        </button>
      )}
    </div>
  );
}

/**
 * Stepper desktop (Figma "Modulo // Desktop" 606:505): due cerchi numerati con
 * connettore — il cerchio dello step corrente/raggiunto è pieno (cta). Solo da lg in
 * su; su mobile lo step resta nel titolo "Step N" (mobile congelato).
 */
function Stepper({ step }: { step: 1 | 2 }) {
  const dot = (n: 1 | 2) =>
    `flex size-16 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
      step >= n ? "bg-cta text-white" : "bg-soft text-cta"
    }`;
  return (
    <div className="hidden items-center justify-center gap-3 lg:flex" aria-hidden>
      <span className={dot(1)}>1</span>
      <span className="h-0.5 w-24 bg-stroke-2" />
      <span className={dot(2)}>2</span>
    </div>
  );
}

/**
 * Immagine laterale del form — SOLO desktop (Figma step 1/2, colonna destra 700×551).
 * `fill` su una cella grid che si stira all'altezza del form (items-stretch).
 */
function FormSideImage() {
  return (
    <div className="relative hidden overflow-hidden rounded-card lg:block">
      <Image
        src="/images/card-musei-vaticani.png"
        alt=""
        fill
        sizes="(min-width: 1024px) 45vw, 0px"
        className="object-cover"
      />
    </div>
  );
}

/**
 * Multi-step "Lavora con noi" application form — pixel-perfect to Figma "Modulo //
 * Mobile" (447:1834 step 1 — personal data, 447:2014 step 2 — documents, 447:2191 —
 * "Candidatura inviata" confirmation) e "Modulo // Desktop" (605:1539/1700/1858:
 * stepper in alto + 2 colonne form/immagine, conferma centrata). Submits
 * multipart/form-data to the `/api/careers/apply` BFF (validated stub until the
 * careers API exists). React Compiler is ON: every state write happens in an event
 * handler, never an effect.
 */
export function CareersApplicationForm({
  lang,
  dict,
  positionTitle,
}: {
  lang: Locale;
  dict: Dictionary["careers"];
  /** When set (apply to a specific role), the title reads "Candidatura per {position} – Step N". */
  positionTitle?: string;
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
        setStep("done");
        return;
      }
      setError(t.errorSubmit);
    } catch {
      setError(t.errorSubmit);
    }
    setSubmitting(false);
  }

  if (step === "done") {
    return <Confirmation lang={lang} dict={dict} />;
  }

  return (
    <section id="modulo" className="scroll-mt-8 py-4 lg:py-12">
      <Container className="flex flex-col gap-4 lg:gap-8">
        <Stepper step={step} />
        <div className="flex flex-col gap-2 text-ink">
          <h2 className="text-2xl font-extrabold leading-tight lg:text-3xl">
            {positionTitle
              ? fill(t.headingPosition, { position: positionTitle, n: String(step) })
              : fill(t.heading, { n: String(step) })}
            <br />
            {t.headingBrand}
          </h2>{/* ds-guard-ignore: titolo Figma desktop 40px→33 scala 0.83 container 1200 */}
          <p className="text-base lg:text-lg">{step === 1 ? t.step1Subtitle : t.step2Subtitle}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleContinue} className="flex flex-col gap-4 lg:gap-6" noValidate>
            {/* Desktop: 2 colonne (campi a sx, immagine a dx). `contents` su mobile →
                i wrapper spariscono e i campi restano nel flusso del form (congelato). */}
            <div className="contents lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-10">
              <div className="contents lg:flex lg:flex-col lg:gap-4">
            <FloatingField
              id="cv-first-name"
              label={t.firstName}
              type="text"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <FloatingField
              id="cv-last-name"
              label={t.lastName}
              type="text"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <FloatingField
              id="cv-email"
              label={t.email}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Phone with country-prefix select (Figma 447:1859) */}
            <div className="flex w-full flex-col gap-1 rounded-card border border-cta p-2">
              <label htmlFor="cv-phone" className="text-xs font-bold text-cta">
                {t.phone}
              </label>
              <div className="flex items-center gap-4">
                <span className="flex h-11 shrink-0 items-center rounded-badge border border-ink px-2">
                  <select
                    aria-label={t.phonePrefix}
                    value={phonePrefix}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    className="bg-transparent text-base font-medium text-ink outline-none"
                  >
                    {PHONE_PREFIXES.map((prefix) => (
                      <option key={prefix} value={prefix}>
                        {prefix}
                      </option>
                    ))}
                  </select>
                </span>
                <input
                  id="cv-phone"
                  type="tel"
                  autoComplete="tel-national"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full flex-1 border-0 bg-transparent p-0 text-base font-medium leading-[22px] text-ink outline-none"
                />
              </div>
            </div>

            <BirthDateField
              id="cv-birth-date"
              label={t.birthDate}
              value={birthDate}
              onChange={setBirthDate}
              lang={lang}
              t={t}
            />
            <FloatingField
              id="cv-residence"
              label={t.residence}
              type="text"
              autoComplete="street-address"
              required
              value={residence}
              onChange={(e) => setResidence(e.target.value)}
            />
            <FloatingField
              id="cv-domicile"
              label={t.domicile}
              type="text"
              value={domicile}
              onChange={(e) => setDomicile(e.target.value)}
            />

            {error && <Flash variant="error">{error}</Flash>}
              </div>
              <FormSideImage />
            </div>

            <button
              type="submit"
              className={`${ctaButton} lg:w-auto lg:self-start lg:px-10`}
            >
              {t.continue}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:gap-6" noValidate>
            {/* Desktop: 2 colonne (upload+consensi a sx, immagine a dx). `contents` su
                mobile → wrapper trasparenti, flusso del form congelato. */}
            <div className="contents lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-10">
              <div className="contents lg:flex lg:flex-col lg:gap-4">
            <FileField
              id="cv-file"
              label={t.cv}
              hint={t.cvHint}
              file={cvFile}
              onSelect={setCvFile}
              removeLabel={t.removeFile}
              disabled={submitting}
            />
            <FileField
              id="cover-file"
              label={t.coverLetter}
              hint={t.coverLetterHint}
              file={coverFile}
              onSelect={setCoverFile}
              removeLabel={t.removeFile}
              disabled={submitting}
            />

            <p className="text-xs font-semibold uppercase leading-snug text-ink">{t.privacyNotice}</p>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={gdpr}
                disabled={submitting}
                onChange={(e) => setGdpr(e.target.checked)}
                className="peer sr-only"
              />
              <span className="flex size-7 shrink-0 items-center justify-center rounded-card border border-cta text-white peer-checked:bg-cta peer-focus-visible:ring-2 peer-focus-visible:ring-cta/40">
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
              <span className="text-base text-ink">{t.gdpr}</span>
            </label>

            {error && <Flash variant="error">{error}</Flash>}
              </div>
              <FormSideImage />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`${ctaButton} lg:w-auto lg:self-start lg:px-10`}
            >
              {submitting ? t.submitting : t.submit}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep(1);
              }}
              disabled={submitting}
              className="text-sm font-semibold text-cta hover:underline disabled:opacity-60 lg:self-start"
            >
              {t.back}
            </button>
          </form>
        )}
      </Container>
    </section>
  );
}

/** "Candidatura inviata" — Figma "Modulo // Mobile" success (447:2191). */
function Confirmation({ lang, dict }: { lang: Locale; dict: Dictionary["careers"] }) {
  const t = dict.success;
  return (
    <section id="modulo" className="scroll-mt-8 py-4 lg:py-20">
      <Container className="flex flex-col items-center gap-4 lg:gap-6">
        <span className="flex size-[77px] shrink-0 items-center justify-center rounded-full bg-ink">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h2 className="text-center text-2xl font-extrabold text-ink lg:text-3xl">{t.title}</h2>{/* ds-guard-ignore: titolo Figma desktop 40px→33 scala 0.83 container 1200 */}
        <p className="text-center text-base text-ink lg:text-lg">{t.subtitle}</p>

        <div className="flex w-full flex-col gap-4 rounded-card bg-soft p-4 lg:max-w-3xl lg:gap-6 lg:p-6">
          <p className="text-sm text-ink">{t.cardText}</p>
          <a
            href={`/${lang}/chi-siamo`}
            className="flex w-full items-center justify-center rounded-card bg-cta py-4 text-base font-bold text-white transition-colors hover:bg-cta-hover active:bg-cta-active"
          >
            {t.cardCta}
          </a>
        </div>
      </Container>
    </section>
  );
}

function DocIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path
        d="M14 3v4a1 1 0 0 0 1 1h4M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7m4 4v6m4-6v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path
        d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
