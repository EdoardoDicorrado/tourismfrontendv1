"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { OrderItems } from "@/components/cart/OrderItems";
import { RedsysChallengeFrame } from "@/components/checkout/RedsysChallengeFrame";
import { RedsysInSiteForm } from "@/components/checkout/RedsysInSiteForm";
import { collectBrowserData } from "@/lib/checkout/browser-data";
import { useCart } from "@/lib/cart/CartContext";
import { countryName, formatMoney } from "@/lib/format";
import type { CartCustomer } from "@/lib/cart/types";
import type {
  CheckoutInvoice,
  PaymentAuthorizeResponse,
  PaymentSessionResponse,
  PaymentStatusResponse,
  PromoApplyResponse,
  PromoQuote,
  RedsysInSiteSession,
} from "@/lib/checkout/types";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Countries shown in the checkout selector (markets we serve first). */
const COUNTRY_CODES = ["IT", "ES", "MX", "AR", "CO", "CL", "PE", "BR", "FR", "DE", "GB", "US", "PT"];

const DEFAULT_COUNTRY: Record<Locale, string> = { it: "IT", es: "ES", en: "GB" };

const inputClass =
  "w-full rounded-[10px] border border-stroke bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-cta disabled:bg-soft/50 disabled:text-ink/50";
const labelClass = "mb-1 block text-sm font-bold text-ink";

/**
 * Checkout payment phase (Redsys InSite + 3DS2), independent of the wizard step:
 *  - `form`        order not yet created (default)
 *  - `paying`      order created, Redsys InSite card form mounted, awaiting idOper
 *  - `authorizing` idOper obtained, authorize in flight
 *  - `challenge`   bank requires 3DS2 → ACS iframe mounted, polling for the outcome
 */
type Phase =
  | { step: "form" }
  | { step: "paying"; reference: string; session: RedsysInSiteSession }
  | { step: "authorizing"; reference: string }
  | {
      step: "challenge";
      reference: string;
      session: RedsysInSiteSession;
      acsURL: string;
      creq: string;
      protocolVersion?: string;
    };

/** Wizard step, mirroring the Figma "04 Checkout" 2-step header. */
type Stage = "contatti" | "pagamento";

const EMPTY_INVOICE = (country: string): CheckoutInvoice => ({
  name: "",
  taxId: "",
  address: "",
  city: "",
  zip: "",
  country,
});

/** Numbered step indicator (1 Contatti · 2 Pagamento). */
function StepPill({
  n,
  label,
  active,
  done,
  onClick,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
  onClick?: () => void;
}) {
  const tone = active || done ? "text-ink" : "text-ink/40";
  const badge = active
    ? "bg-cta text-white"
    : done
      ? "bg-cta/15 text-cta"
      : "bg-soft text-ink/50";
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={`flex items-center gap-2 ${tone} ${onClick ? "hover:opacity-80" : ""}`}
    >
      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${badge}`}>
        {n}
      </span>
      <span className="text-sm font-bold">{label}</span>
    </Tag>
  );
}

/** Checkout page body — 2-step wizard (contact + participants + invoice → payment), order summary. */
export function CheckoutView({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const router = useRouter();
  const { items, hydrated, total, clear } = useCart();
  const t = dict.checkout;

  const [stage, setStage] = useState<Stage>("contatti");
  const [customer, setCustomer] = useState<CartCustomer>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: DEFAULT_COUNTRY[lang],
    notes: "",
  });

  // Per-participant names, grouped by cart item, expanded from each line's qty.
  const paxGroups = useMemo(
    () =>
      items
        .map((item) => ({
          itemId: item.id,
          itemTitle: item.title,
          slots: item.lines.flatMap((line) =>
            Array.from({ length: line.qty }, (_, i) => ({
              id: `${item.id}#${line.key}#${i}`,
              label: `${line.label} ${i + 1}`,
            })),
          ),
        }))
        .filter((g) => g.slots.length > 0),
    [items],
  );
  const hasPax = paxGroups.some((g) => g.slots.length > 0);
  const multiItem = paxGroups.length > 1;
  const [pax, setPax] = useState<Record<string, { firstName: string; lastName: string }>>({});
  const setPaxField = (id: string, key: "firstName" | "lastName", value: string) =>
    setPax((p) => {
      const current = p[id] ?? { firstName: "", lastName: "" };
      return { ...p, [id]: { ...current, [key]: value } };
    });

  const [invoiceOn, setInvoiceOn] = useState(false);
  const [invoice, setInvoice] = useState<CheckoutInvoice>(EMPTY_INVOICE(DEFAULT_COUNTRY[lang]));
  const setInv =
    (key: keyof CheckoutInvoice) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setInvoice((v) => ({ ...v, [key]: e.target.value }));

  // Promo code: the discount is ALWAYS computed server-side (offer integrity). The
  // input asks the storefront promo endpoint for a non-binding quote; until it ships
  // every code degrades to an honest "not available" — we never fake a discount. The
  // authoritative apply happens at order creation via `promoCode` in the payload.
  const [promo, setPromo] = useState("");
  const [promoMsg, setPromoMsg] = useState<string | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoQuote | null>(null);
  const discount = appliedPromo?.discount ?? 0;
  const payable = Math.max(0, total - discount);
  const applyPromo = async () => {
    const code = promo.trim();
    if (!code || promoBusy) return;
    setPromoBusy(true);
    setPromoMsg(null);
    try {
      const res = await fetch("/api/checkout/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, items, locale: lang }),
      });
      const data = (await res.json()) as PromoApplyResponse;
      if (res.ok && data.ok && data.applied) {
        setAppliedPromo(data.quote);
        setPromoMsg(fill(t.promo.applied, { amount: formatMoney(data.quote.discount, lang) }));
      } else {
        setAppliedPromo(null);
        const reason = res.ok && data.ok && !data.applied ? data.reason : "unavailable";
        setPromoMsg(reason === "invalid" ? t.promo.invalid : t.promo.unavailable);
      }
    } catch {
      setAppliedPromo(null);
      setPromoMsg(t.promo.unavailable);
    } finally {
      setPromoBusy(false);
    }
  };

  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>({ step: "form" });
  const formRef = useRef<HTMLFormElement>(null);

  // Snapshot of the active payment context, read by the (stable) token handler.
  const payCtx = useRef<{ reference: string; session: RedsysInSiteSession } | null>(null);

  const set =
    (key: keyof CartCustomer) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setCustomer((c) => ({ ...c, [key]: e.target.value }));

  /** Validate the mounted contact (+ invoice) fields, then advance to payment. */
  function goToPayment() {
    if (formRef.current && !formRef.current.reportValidity()) return;
    setStage("pagamento");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** Flatten the per-participant names for the order payload. */
  const collectParticipants = () =>
    paxGroups.flatMap((g) =>
      g.slots.map((s) => ({
        itemId: g.itemId,
        label: s.label,
        firstName: pax[s.id]?.firstName ?? "",
        lastName: pax[s.id]?.lastName ?? "",
      })),
    );

  /** Hand the completed order to the confirmation screen (this browser session only). */
  const finalize = useCallback(
    (reference: string) => {
      sessionStorage.setItem(
        "tm_last_order",
        JSON.stringify({ reference, items, customer, total: payable, lang }),
      );
      clear();
      router.push(`/${lang}/checkout/conferma`);
    },
    [items, customer, payable, lang, clear, router],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || phase.step !== "form") return;
    setSubmitting(true);
    setError(null);
    try {
      // 1. Create the order (backend is the single writer).
      const orderRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer,
          participants: collectParticipants(),
          invoice: invoiceOn ? invoice : null,
          // Only a successfully-quoted code is bound; the backend re-validates + applies it.
          promoCode: appliedPromo?.code,
          locale: lang,
        }),
      });
      const orderData = (await orderRes.json()) as { ok?: boolean; reference?: string };
      if (!orderRes.ok || !orderData.ok || !orderData.reference) throw new Error("order");
      const reference = orderData.reference;

      // 2. Open a payment session for that order.
      const sesRes = await fetch("/api/checkout/payment/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, locale: lang }),
      });
      const sesData = (await sesRes.json()) as PaymentSessionResponse;
      if (!sesRes.ok || !sesData.ok) throw new Error("session");

      if (sesData.provider === "redsys") {
        // Mount the hosted card form; the user pays inside the Redsys iframe.
        payCtx.current = { reference, session: sesData.session };
        setPhase({ step: "paying", reference, session: sesData.session });
        setSubmitting(false);
        return;
      }

      // No gateway configured → preview/mock order, nothing charged (current behavior).
      finalize(reference);
    } catch {
      setError(t.error);
      setSubmitting(false);
    }
  }

  const handleToken = useCallback(
    async (idOper: string) => {
      const ctx = payCtx.current;
      if (!ctx) return;
      setError(null);
      setPhase({ step: "authorizing", reference: ctx.reference });
      try {
        const res = await fetch("/api/checkout/payment/authorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionId: ctx.session.transactionId,
            idOper,
            locale: lang,
            // EMV3DS browser data — required by the 3DS2 authentication leg.
            browser: collectBrowserData(),
          }),
        });
        const data = (await res.json()) as PaymentAuthorizeResponse;
        if (!res.ok || !data.ok) throw new Error("authorize");

        if (data.status === "authorized") {
          finalize(ctx.reference);
          return;
        }
        if (data.status === "challenge") {
          // Bank requires SCA → mount the ACS iframe; the poll effect below
          // resolves the outcome once the cardholder completes the challenge.
          setPhase({
            step: "challenge",
            reference: ctx.reference,
            session: ctx.session,
            acsURL: data.acsURL,
            creq: data.creq,
            protocolVersion: data.protocolVersion,
          });
          return;
        }
        // Declined — let the user retry with the still-mounted card form.
        setError(fill(t.payment.declined, { code: data.code }));
        setPhase({ step: "paying", reference: ctx.reference, session: ctx.session });
      } catch {
        setError(t.payment.failed);
        setPhase({ step: "paying", reference: ctx.reference, session: ctx.session });
      }
    },
    [lang, t, finalize],
  );

  const handleCardError = useCallback(
    (code: string) => setError(fill(t.payment.declined, { code })),
    [t],
  );

  // 3DS2 challenge poll: once the ACS iframe is mounted the charge completes
  // server-side (the ACS posts `cres` to /payments/redsys/3ds-callback). We poll
  // the transaction status until it leaves `pending` — `authorized` → confirmation,
  // `failed`/timeout → re-arm the card form. Bounded to ~3 min so it never hangs.
  useEffect(() => {
    if (phase.step !== "challenge") return;
    const { reference, session } = phase;
    const transactionId = session.transactionId;
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(
          `/api/checkout/payment/status?transactionId=${encodeURIComponent(transactionId)}&lang=${lang}`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as PaymentStatusResponse;
        if (cancelled) return;
        if (res.ok && data.ok && data.status === "authorized") {
          finalize(reference);
          return;
        }
        if (res.ok && data.ok && data.status === "failed") {
          setError(t.payment.failed);
          setPhase({ step: "paying", reference, session });
          return;
        }
      } catch {
        if (cancelled) return;
      }
      if (attempts >= 60) {
        setError(t.payment.failed);
        setPhase({ step: "paying", reference, session });
        return;
      }
      timer = setTimeout(poll, 3000);
    };

    timer = setTimeout(poll, 3000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phase, lang, finalize, t]);

  if (!hydrated) {
    return (
      <Container className="py-16">
        <div className="h-40" aria-hidden />
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-16 text-center">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.emptyTitle}</h1>
        <ButtonLink href={`/${lang}/attivita/roma`} size="md" className="mt-6">
          {t.emptyCta}
        </ButtonLink>
      </Container>
    );
  }

  const locked = phase.step !== "form";
  const onContact = stage === "contatti";

  return (
    <Container className="py-10">
      <Link href={`/${lang}/carrello`} className="text-sm font-bold text-cta hover:underline">
        ← {t.backToCart}
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">{t.title}</h1>

      {/* Wizard steps */}
      <div className="mt-4 flex items-center gap-3">
        <StepPill
          n={1}
          label={t.steps.contact}
          active={onContact}
          done={!onContact}
          onClick={!onContact && !locked ? () => setStage("contatti") : undefined}
        />
        <span className="h-px w-8 bg-soft-grey" aria-hidden />
        <StepPill n={2} label={t.steps.payment} active={!onContact} done={false} />
      </div>

      <form onSubmit={handleSubmit} ref={formRef} className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          {onContact ? (
            <>
              {/* Contact details */}
              <section className="rounded-[15px] border border-soft-grey bg-white p-5 sm:p-6">
                <h2 className="text-lg font-extrabold text-ink">{t.contactTitle}</h2>
                <fieldset disabled={locked} className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className={labelClass}>
                      {t.firstName}
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      required
                      autoComplete="given-name"
                      value={customer.firstName}
                      onChange={set("firstName")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className={labelClass}>
                      {t.lastName}
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      required
                      autoComplete="family-name"
                      value={customer.lastName}
                      onChange={set("lastName")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      {t.email}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={customer.email}
                      onChange={set("email")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      {t.phone}
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={customer.phone}
                      onChange={set("phone")}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="country" className={labelClass}>
                      {t.country}
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={customer.country}
                      onChange={set("country")}
                      className={inputClass}
                    >
                      {COUNTRY_CODES.map((code) => (
                        <option key={code} value={code}>
                          {countryName(code, lang)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="notes" className={labelClass}>
                      {t.notes}
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={customer.notes}
                      onChange={set("notes")}
                      placeholder={t.notesPlaceholder}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </fieldset>
              </section>

              {/* Participants */}
              {hasPax && (
                <section className="rounded-[15px] border border-soft-grey bg-white p-5 sm:p-6">
                  <h2 className="text-lg font-extrabold text-ink">{t.participantsTitle}</h2>
                  <p className="mt-1 text-sm text-ink/60">{t.participantsNote}</p>
                  <div className="mt-4 flex flex-col gap-6">
                    {paxGroups.map((g) => (
                      <div key={g.itemId} className="flex flex-col gap-4">
                        {multiItem && (
                          <p className="text-sm font-bold text-cta">{g.itemTitle}</p>
                        )}
                        {g.slots.map((s) => (
                          <fieldset key={s.id} disabled={locked} className="flex flex-col gap-2">
                            <p className="text-sm font-bold text-ink">{s.label}</p>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <label htmlFor={`pf-${s.id}`} className={labelClass}>
                                  {t.firstName}
                                </label>
                                <input
                                  id={`pf-${s.id}`}
                                  autoComplete="off"
                                  value={pax[s.id]?.firstName ?? ""}
                                  onChange={(e) => setPaxField(s.id, "firstName", e.target.value)}
                                  className={inputClass}
                                />
                              </div>
                              <div>
                                <label htmlFor={`pl-${s.id}`} className={labelClass}>
                                  {t.lastName}
                                </label>
                                <input
                                  id={`pl-${s.id}`}
                                  autoComplete="off"
                                  value={pax[s.id]?.lastName ?? ""}
                                  onChange={(e) => setPaxField(s.id, "lastName", e.target.value)}
                                  className={inputClass}
                                />
                              </div>
                            </div>
                          </fieldset>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Invoice */}
              <section className="rounded-[15px] border border-soft-grey bg-white p-5 sm:p-6">
                <label className="flex items-center gap-3 text-ink">
                  <input
                    type="checkbox"
                    checked={invoiceOn}
                    disabled={locked}
                    onChange={(e) => setInvoiceOn(e.target.checked)}
                    className="h-5 w-5 shrink-0 accent-cta"
                  />
                  <span className="font-extrabold">{t.invoiceQuestion}</span>
                </label>
                {invoiceOn && (
                  <fieldset disabled={locked} className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="inv-name" className={labelClass}>
                        {t.invoiceName}
                      </label>
                      <input
                        id="inv-name"
                        required={invoiceOn}
                        value={invoice.name}
                        onChange={setInv("name")}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="inv-tax" className={labelClass}>
                        {t.invoiceTaxId}
                      </label>
                      <input
                        id="inv-tax"
                        required={invoiceOn}
                        value={invoice.taxId}
                        onChange={setInv("taxId")}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="inv-address" className={labelClass}>
                        {t.invoiceAddress}
                      </label>
                      <input
                        id="inv-address"
                        value={invoice.address}
                        onChange={setInv("address")}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="inv-city" className={labelClass}>
                        {t.invoiceCity}
                      </label>
                      <input
                        id="inv-city"
                        value={invoice.city}
                        onChange={setInv("city")}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="inv-zip" className={labelClass}>
                        {t.invoiceZip}
                      </label>
                      <input
                        id="inv-zip"
                        value={invoice.zip}
                        onChange={setInv("zip")}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="inv-country" className={labelClass}>
                        {t.country}
                      </label>
                      <select
                        id="inv-country"
                        value={invoice.country}
                        onChange={setInv("country")}
                        className={inputClass}
                      >
                        {COUNTRY_CODES.map((code) => (
                          <option key={code} value={code}>
                            {countryName(code, lang)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </fieldset>
                )}
              </section>
            </>
          ) : (
            <>
              {/* Promo code (honestly gated — no client-side discount) */}
              <section className="rounded-[15px] border border-soft-grey bg-white p-5 sm:p-6">
                <h2 className="text-lg font-extrabold text-ink">{t.promo.title}</h2>
                <div className="mt-3 flex gap-3">
                  <input
                    value={promo}
                    disabled={locked}
                    onChange={(e) => {
                      setPromo(e.target.value);
                      setPromoMsg(null);
                      setAppliedPromo(null);
                    }}
                    placeholder={t.promo.placeholder}
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={locked || promoBusy}
                    className="shrink-0 rounded-[10px] bg-ink px-5 font-extrabold text-white transition-colors hover:bg-ink/90 disabled:opacity-60"
                  >
                    {t.promo.apply}
                  </button>
                </div>
                {promoMsg && (
                  <p className={`mt-2 text-sm ${appliedPromo ? "font-semibold text-cta" : "text-ink/60"}`}>
                    {promoMsg}
                  </p>
                )}
              </section>

              {/* Payment */}
              <section className="rounded-[15px] border border-soft-grey bg-white p-5 sm:p-6">
                <h2 className="text-lg font-extrabold text-ink">{t.paymentTitle}</h2>

                {phase.step === "paying" ? (
                  <div className="mt-3">
                    <p className="rounded-[10px] bg-soft px-4 py-3 text-sm text-ink/70">
                      {t.payment.secureNote}
                    </p>
                    <p className="mt-3 text-sm text-ink/50">{t.payment.loadingForm}</p>
                    <div className="mt-2">
                      <RedsysInSiteForm
                        session={phase.session}
                        payButtonLabel={t.payment.payButton}
                        onToken={handleToken}
                        onError={handleCardError}
                      />
                    </div>
                  </div>
                ) : phase.step === "authorizing" ? (
                  <p className="mt-3 flex items-center gap-3 rounded-[10px] bg-soft px-4 py-3 text-sm font-semibold text-ink">
                    <span
                      className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-cta border-t-transparent"
                      aria-hidden
                    />
                    {t.payment.processing}
                  </p>
                ) : phase.step === "challenge" ? (
                  <div className="mt-3">
                    <div className="rounded-[10px] border border-stroke bg-soft/40 px-4 py-4">
                      <p className="font-bold text-ink">{t.payment.challengeTitle}</p>
                      <p className="mt-1 text-sm text-ink/70">{t.payment.challengeBody}</p>
                    </div>
                    <RedsysChallengeFrame acsURL={phase.acsURL} creq={phase.creq} />
                    <p className="mt-3 flex items-center gap-3 text-sm font-semibold text-ink/70">
                      <span
                        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-cta border-t-transparent"
                        aria-hidden
                      />
                      {t.payment.challengeWaiting}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 rounded-[10px] bg-soft px-4 py-3 text-sm text-ink/70">
                    {t.paymentNote}
                  </p>
                )}
              </section>

              {/* Terms */}
              <label className="flex items-start gap-3 text-sm text-ink">
                <input
                  type="checkbox"
                  required
                  checked={terms}
                  disabled={locked}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-cta"
                />
                <span>{t.termsLabel}</span>
              </label>
            </>
          )}
        </div>

        {/* Summary + CTA */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-[15px] bg-soft p-5 sm:p-6">
            <h2 className="text-lg font-extrabold text-ink">{t.summaryTitle}</h2>
            <div className="mt-3">
              <OrderItems items={items} lang={lang} dict={dict} compact />
            </div>
            <div className="mt-4 border-t border-soft-grey pt-4">
              {discount > 0 && (
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-cta">
                  <span>{appliedPromo?.label ?? t.promo.discount}</span>
                  <span>−{formatMoney(discount, lang)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-lg font-extrabold text-ink">
                <span>{t.total}</span>
                <span>{formatMoney(payable, lang)}</span>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-[10px] bg-badge/10 px-4 py-3 text-sm font-semibold text-badge"
              >
                {error}
              </p>
            )}

            {onContact ? (
              <Button type="button" onClick={goToPayment} size="md" fullWidth className="mt-5 gap-2">
                {t.continueToPayment}
              </Button>
            ) : phase.step === "form" ? (
              <Button type="submit" disabled={submitting} size="md" fullWidth className="mt-5 gap-2">
                {submitting ? t.processing : t.submit}
              </Button>
            ) : (
              <p className="mt-5 text-center text-sm font-semibold text-ink/70">
                {phase.step === "paying" ? t.payment.payHint : t.payment.processing}
              </p>
            )}

            {!onContact && !locked && (
              <button
                type="button"
                onClick={() => setStage("contatti")}
                className="mt-3 w-full text-center text-sm font-bold text-cta hover:underline"
              >
                ← {t.editContact}
              </button>
            )}

            <div className="mt-4 flex items-center justify-center gap-2 opacity-80">
              {[
                "/images/pay-visa.svg",
                "/images/pay-mastercard.svg",
                "/images/pay-amex.svg",
                "/images/pay-paypal.svg",
              ].map((src) => (
                <span key={src} className="flex h-7 w-11 items-center justify-center rounded bg-white px-1">
                  <Image src={src} alt="" width={32} height={20} className="h-auto w-auto" />
                </span>
              ))}
            </div>
          </div>
        </aside>
      </form>
    </Container>
  );
}
