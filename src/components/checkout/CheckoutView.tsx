"use client";

import "flag-icons/css/flag-icons.min.css";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { duration, ease } from "@/lib/motion/tokens";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CancellationBox, OrderSummaryCard } from "@/components/checkout/OrderSummaryCard";
import { CountrySelect, DIAL, PhonePrefixSelect } from "@/components/checkout/CountrySelects";
import { RedsysChallengeFrame } from "@/components/checkout/RedsysChallengeFrame";
import { RedsysInSiteForm } from "@/components/checkout/RedsysInSiteForm";
import { collectBrowserData } from "@/lib/checkout/browser-data";
import { LoginModal } from "@/components/account/LoginModal";
import { useDemoUser } from "@/lib/auth/demoUser";
import { useCart } from "@/lib/cart/CartContext";
import { formatDateLong, formatMoney } from "@/lib/format";
import type { CartCustomer } from "@/lib/cart/types";
import type {
  CheckoutInvoice,
  PaymentAuthorizeResponse,
  PaymentSessionResponse,
  PaymentStatusResponse,
  PromoApplyResponse,
  PromoQuote,
  RedsysInSiteSession,
  VerifyCheckResponse,
} from "@/lib/checkout/types";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { CheckoutAgency } from "@/lib/checkout/agency";

const DEFAULT_COUNTRY: Record<Locale, string> = { it: "IT", es: "ES", en: "GB" };

/** FALLBACK: il carrello ora porta rating/features/cancellation dal prodotto (CartItem
 *  meta, popolato in BookingBox). Questi mock restano solo per le entry che non hanno il
 *  meta (carrelli vecchi / righe senza prodotto), così il riepilogo Figma resta completo. */
const PREVIEW_RATING = 4.7;
const PREVIEW_FEATURES = [
  { label: "Durata 4 Ore" },
  { label: "Visita guidata" },
  { label: "Lingua inglese" },
];

/** Colori brand PayPal (giustificati: brand ufficiale, non token DS). */
const PAYPAL_BG = "#ffc439"; // ds-guard-ignore brand PayPal
const PAYPAL_FG = "#003087"; // ds-guard-ignore brand PayPal

const inputClass =
  "w-full rounded-card border border-stroke bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-cta disabled:bg-soft/50 disabled:text-ink/50";

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

/** Wizard step, mirroring the Figma "Checkout// Mobile" 2-step header. */
type Stage = "contatti" | "verifica" | "pagamento";

const EMPTY_INVOICE = (country: string): CheckoutInvoice => ({
  name: "",
  taxId: "",
  address: "",
  city: "",
  zip: "",
  country,
});

/** Two-step header pills — Figma "Checkout// Mobile" (node 76:14116). */
function StepTabs({
  current,
  labels,
  onBack,
}: {
  current: Stage;
  labels: { contact: string; payment: string };
  onBack?: () => void;
}) {
  const onContact = current === "contatti";
  const base = "flex-1 rounded-card p-2 text-center text-sm font-medium text-white";
  return (
    <div className="flex w-full gap-2 py-2">
      {onContact || !onBack ? (
        <div
          className={`${base} ${onContact ? "bg-ink" : "bg-stroke-2"}`}
          aria-current={onContact ? "step" : undefined}
        >
          1 {labels.contact}
        </div>
      ) : (
        <button type="button" onClick={onBack} className={`${base} bg-stroke-2 hover:opacity-90`}>
          1 {labels.contact}
        </button>
      )}
      <div
        className={`${base} ${onContact ? "bg-stroke-2" : "bg-ink"}`}
        aria-current={!onContact ? "step" : undefined}
      >
        2 {labels.payment}
      </div>
    </div>
  );
}

/** Bordered "floating label" text field — Figma checkout (node 76:15500). */
function FloatingInput({
  id,
  label,
  className = "",
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  // "Attivo" (bordo + label cta) sia in focus SIA quando il campo è compilato; vuoto e
  // non in focus → ink (blu scuro). Richiesta: il valore inserito mantiene il colore attivo.
  const filled = props.value != null && String(props.value).length > 0;
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
        className={`w-full border-0 bg-transparent p-0 text-base font-medium leading-[22px] text-ink outline-none placeholder:text-ink/40 ${className}`}
        {...props}
      />
    </div>
  );
}

/** Radio indicator for the payment-method cards. */
function RadioDot({ on }: { on: boolean }) {
  return (
    <span
      className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${
        on ? "border-cta" : "border-stroke"
      }`}
      aria-hidden
    >
      {on && <span className="size-2.5 rounded-full bg-cta" />}
    </span>
  );
}

/** Checkout page body — 2-step wizard (contact + participants + invoice → payment), order summary. */
export function CheckoutView({
  lang,
  dict,
  agency = null,
  loggedIn = false,
}: {
  lang: Locale;
  dict: Dictionary;
  /** Set when a signed-in agency checks out → contact/billing/payment use its data. */
  agency?: CheckoutAgency | null;
  /** Any signed-in user (customer/agency) skips the email-verification interstitial. */
  loggedIn?: boolean;
}) {
  const router = useRouter();
  const { items, hydrated, total, clear } = useCart();
  const t = dict.checkout;

  const [stage, setStage] = useState<Stage>("contatti");
  // Agency → seed the buyer from the agency contact (read-only in the UI, changed
  // from the profile). Otherwise TEMP (Edoardo): precompiled fields to speed up UI
  // dev — RIMUOVERE quando il checkout va testato con dati reali.
  const [customer, setCustomer] = useState<CartCustomer>(() =>
    agency
      ? {
          firstName: agency.name,
          lastName: "",
          email: agency.email,
          phone: agency.phone,
          country: agency.phonePrefix,
          notes: "",
        }
      : {
          firstName: "Mario",
          lastName: "Rossi",
          email: "test@test.it",
          phone: "3331234567",
          country: DEFAULT_COUNTRY[lang],
          notes: "",
        },
  );

  // PREVIEW: un cliente "loggato" è il demo user (name+email). L'agenzia ha la sessione
  // server (gestita sopra); l'affiliato non ha ancora auth (pendente full-stack), quindi
  // qui copre l'utente. Loggato → dati personali GIÀ salvati: card read-only + "Modifica".
  const demoUser = useDemoUser();
  const loggedInUser = agency ? null : demoUser;
  const [loginOpen, setLoginOpen] = useState(false);
  // Seed dei dati personali dal demo user, una volta sola dopo l'hydration (lo store è
  // null in SSR, e diventa disponibile al login dalla modale). Il ref evita ri-seed.
  const seededUserRef = useRef(false);
  useEffect(() => {
    if (agency || seededUserRef.current || !demoUser) return;
    seededUserRef.current = true;
    const [first, ...rest] = demoUser.name.trim().split(/\s+/);
    setCustomer((c) => ({
      ...c,
      firstName: first ?? c.firstName,
      lastName: rest.join(" ") || c.lastName,
      email: demoUser.email || c.email,
    }));
  }, [agency, demoUser]);

  // Per-participant names, grouped by cart item, expanded from each line's qty.
  const paxGroups = useMemo(
    () =>
      items
        .map((item) => ({
          itemId: item.id,
          itemTitle: item.title,
          itemImage: item.image,
          itemDate: `${formatDateLong(item.date, lang)} · ${item.slot}`,
          slots: item.lines.flatMap((line) =>
            Array.from({ length: line.qty }, (_, i) => ({
              id: `${item.id}#${line.key}#${i}`,
              label: `${line.label} ${i + 1}`,
            })),
          ),
        }))
        .filter((g) => g.slots.length > 0),
    [items, lang],
  );
  const hasPax = paxGroups.some((g) => g.slots.length > 0);
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

  const [method, setMethod] = useState<"card" | "paypal">("card");
  // Agency saved-method picker (Step 2): default = the agency's default method;
  // "Cambia metodo di pagamento" expands the saved list; "Aggiungi nuovo metodo"
  // falls back to the standard card/PayPal entry accordion.
  const defaultMethodId =
    agency?.paymentMethods.find((m) => m.isDefault)?.id ?? agency?.paymentMethods[0]?.id ?? "";
  const [savedMethodId, setSavedMethodId] = useState(defaultMethodId);
  const [methodPickerOpen, setMethodPickerOpen] = useState(false);
  const [addingNewMethod, setAddingNewMethod] = useState(false);
  const selectedSavedMethod = agency?.paymentMethods.find((m) => m.id === savedMethodId) ?? null;
  const reduceMotion = useReducedMotion();
  // Step 2: "Modifica" apre l'editing INLINE (campi compilabili + Salva), NON torna allo step 1.
  const [editContact, setEditContact] = useState(false);
  const [editPax, setEditPax] = useState(false);
  // MOCKUP carta — solo VISIVO per il layout Figma. NON viene inviato: la cattura reale
  // della carta avviene nel form Redsys InSite (iframe PCI). Vedi nota PM/full-stack.
  const [mockCard, setMockCard] = useState({ number: "", exp: "", cvc: "", save: false });
  // Reservation hold countdown (15:00 → 0:00). Plain per-second decrement — no
  // Date.now() so SSR stays deterministic; backgrounded-tab drift is fine here.
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [code, setCode] = useState("123456"); // TEMP (Edoardo): OTP precompilato (dev UI)
  // Email-verification (OTP) interstitial state.
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyNote, setVerifyNote] = useState<string | null>(null);
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

  /** Email the lead booker a one-time code (via the verify BFF). Preview: no-op success. */
  const sendCode = useCallback(async () => {
    if (!customer.email) return;
    try {
      await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email: customer.email, locale: lang }),
      });
    } catch {
      /* preview / network: the interstitial still lets the user proceed */
    }
  }, [customer.email, lang]);

  /** Validate the mounted contact (+ invoice) fields, then advance to email verification. */
  function goToPayment() {
    if (formRef.current && !formRef.current.reportValidity()) return;
    // Logged-in users (customer/agency) skip the email-verification interstitial —
    // it only gates guests proving ownership of the contact email.
    if (loggedIn || loggedInUser) {
      setStage("pagamento");
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setVerifyError(null);
    setVerifyNote(null);
    setCode("");
    setStage("verifica");
    void sendCode();
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** Re-send the verification code on demand. */
  async function resendCode() {
    setVerifyError(null);
    await sendCode();
    setVerifyNote(t.verifyResent);
  }

  /** Confirm the emailed verification code via the BFF, then advance to payment. */
  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (verifyBusy) return;
    setVerifyBusy(true);
    setVerifyError(null);
    setVerifyNote(null);
    try {
      const res = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check", email: customer.email, code, locale: lang }),
      });
      const data = (await res.json()) as VerifyCheckResponse;
      if (res.ok && data.ok && data.verified) {
        setStage("pagamento");
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const reason = res.ok && data.ok && !data.verified ? data.reason : "unavailable";
      setVerifyError(
        reason === "invalid" ? t.verifyInvalid : reason === "expired" ? t.verifyExpired : t.verifyError,
      );
    } catch {
      setVerifyError(t.verifyError);
    } finally {
      setVerifyBusy(false);
    }
  }

  /** Flatten the per-participant names for the order payload. */
  const collectParticipants = () =>
    paxGroups.flatMap((g) =>
      g.slots.map((s) => ({
        itemId: g.itemId,
        label: s.label,
        firstName: pax[s.id]?.firstName ?? "Mario",
        lastName: pax[s.id]?.lastName ?? "Rossi",
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

  // Reservation hold countdown — ticks only on the payment stage.
  useEffect(() => {
    if (stage !== "pagamento") return;
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [stage]);

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
        <Button type="button" onClick={() => router.push(`/${lang}/attivita/roma`)} size="md" className="mt-6">
          {t.emptyCta}
        </Button>
      </Container>
    );
  }

  // Email-verification interstitial (Figma "Checkout/ verifica/ Mobile" 76:15816).
  // Niente ritorno a "Modifica contatti" da qui: i dati si cambiano nello step 2.
  if (stage === "verifica") {
    return (
      <Container className="py-16">
        <div className="mx-auto flex min-h-[70vh] max-w-[420px] flex-col items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex size-[77px] items-center justify-center rounded-full bg-ink">
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
            <h1 className="text-2xl font-extrabold text-ink">{t.verifyTitle}</h1>
          </div>
          <form onSubmit={verifyCode} className="flex w-full flex-col gap-4">
            <FloatingInput
              id="verify-code"
              name="code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              label={t.verifyCodeLabel}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setVerifyError(null);
              }}
            />
            {verifyError && (
              <p role="alert" className="text-sm font-semibold text-badge">
                {verifyError}
              </p>
            )}
            {verifyNote && !verifyError && (
              <p className="text-sm font-medium text-cta">{verifyNote}</p>
            )}
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={verifyBusy}>
              {verifyBusy ? t.processing : t.verifyCta}
            </Button>
            <button
              type="button"
              onClick={resendCode}
              disabled={verifyBusy}
              className="text-sm font-bold text-cta hover:underline disabled:opacity-60"
            >
              {t.verifyResend}
            </button>
          </form>
        </div>
      </Container>
    );
  }

  const locked = phase.step !== "form";
  const onContact = stage === "contatti";
  // Agency "Modifica" links land on the profile (email + company data are changed there).
  const profileHref = `/${lang}/agenzie/profilo`;
  const reservedTime = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  // Riepilogo ordine — step 1 in cima al flusso; step 2 SOTTO la card del metodo di
  // pagamento (Figma "Checkout/ pagamento/ Mobile" 76:16092).
  const orderSummary = (
    <section className="flex flex-col gap-2">
      <h2 className="text-2xl font-extrabold text-ink">{t.summaryTitle}</h2>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <OrderSummaryCard
            key={item.id}
            collapsible
            image={item.image}
            title={item.title}
            rating={item.rating ?? PREVIEW_RATING}
            features={
              item.features && item.features.length > 0
                ? item.features.map((label) => ({ label }))
                : PREVIEW_FEATURES
            }
            price={formatMoney(item.total, lang)}
            dateLabel={`${formatDateLong(item.date, lang)} · ${item.slot}`}
            paxLines={item.lines.map(
              (l) => `${l.qty} ${l.label} x ${formatMoney(l.unitPrice, lang)}`,
            )}
            cancellationLabel={dict.booking.freeCancellation}
            cancellationNote={item.cancellationNote}
            savingsLabel={fill(t.savings, {
              amount: formatMoney(
                item.discountPercent > 0
                  ? item.total / (1 - item.discountPercent / 100) - item.total
                  : 48, // PREVIEW: nessuno sconto reale sul carrello mock
                lang,
              ),
            })}
          />
        ))}
      </div>
    </section>
  );

  return (
    <>
    <Container className="py-6">
      <h1 className="sr-only">{t.title}</h1>

      <StepTabs
        current={stage}
        labels={t.steps}
        onBack={!onContact && !locked ? () => setStage("contatti") : undefined}
      />

      <form onSubmit={handleSubmit} ref={formRef} className="mt-2 flex flex-col gap-8">
        {!onContact && (
          <div className="flex items-center justify-center gap-3 rounded-card bg-badge/10 px-4 py-3 text-sm font-semibold text-badge">
            {/* Cronometro (Figma 76:16092 "Posto riservato per…"). */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0 text-badge"
              aria-hidden
            >
              <rect x="5" y="6" width="14" height="15" rx="5" stroke="currentColor" strokeWidth="2" />
              <path d="M9 3.5h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 11v3l2 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{fill(t.reservation, { time: reservedTime })}</span>
          </div>
        )}
        {/* Step 1: riepilogo in cima. Step 2: spostato SOTTO la card del metodo di pagamento. */}
        {onContact && orderSummary}

        {onContact ? (
          <>
            {/* Agenzia: card "Dati agenzia" (email fissa + telefono, "Modifica" → profilo);
                niente form dati personali, niente blocco fattura. */}
            {agency ? (
              <section className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-extrabold text-ink">{t.agency.contactTitle}</h2>
                  <p className="text-base text-ink">{t.agency.contactNote}</p>
                </div>
                <div className="flex flex-col gap-3 rounded-card border border-soft-grey bg-white p-4 text-base text-ink">
                  <p className="font-bold">{agency.name}</p>
                  {/* Email = campo fisso, si cambia dal profilo (Modifica). */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 break-all">{agency.email}</span>
                    <Link
                      href={profileHref}
                      className="shrink-0 text-sm font-bold text-cta hover:underline"
                    >
                      {t.edit}
                    </Link>
                  </div>
                  {agency.phone && (
                    <p>
                      {DIAL[agency.phonePrefix] ?? ""} {agency.phone}
                    </p>
                  )}
                </div>
              </section>
            ) : (
            <>
            {/* Personal data (Figma node 76:14136) */}
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-extrabold text-ink">{t.contactTitle}</h2>
                <p className="text-base text-ink">{t.contactSubtitle}</p>
                {/* Guest: magari ha un account ma non si è loggato → accesso rapido
                    (il login prefilla i dati personali). */}
                {!loggedInUser && (
                  <p className="text-sm text-ink">
                    {t.haveAccount}{" "}
                    <button
                      type="button"
                      onClick={() => setLoginOpen(true)}
                      className="font-bold text-cta hover:underline"
                    >
                      {t.loginCta}
                    </button>
                  </p>
                )}
              </div>
              {loggedInUser && !editContact ? (
                /* Loggato (utente/affiliato): dati personali GIÀ salvati → card read-only
                   + "Modifica" inline (come l'agenzia). I partecipanti restano da inserire. */
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setEditContact(true)}
                      className="text-sm font-bold text-cta hover:underline"
                    >
                      {t.edit}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 rounded-card border border-soft-grey bg-white p-4 text-base text-ink">
                    <p className="font-bold">
                      {`${customer.firstName} ${customer.lastName}`.trim() || "—"}
                    </p>
                    <p className="break-all">{customer.email || "—"}</p>
                    {customer.phone && (
                      <p>
                        {DIAL[customer.country] ?? ""} {customer.phone}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <fieldset disabled={locked} className="flex flex-col gap-4">
                    <FloatingInput
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      label={t.email}
                      value={customer.email}
                      onChange={set("email")}
                    />
                    <FloatingInput
                      id="firstName"
                      name="firstName"
                      required
                      autoComplete="given-name"
                      label={t.firstName}
                      value={customer.firstName}
                      onChange={set("firstName")}
                    />
                    <FloatingInput
                      id="lastName"
                      name="lastName"
                      required
                      autoComplete="family-name"
                      label={t.lastName}
                      value={customer.lastName}
                      onChange={set("lastName")}
                    />

                    {/* Phone with country-dial prefix dropdown (Figma node 221:96) */}
                    <div className="group flex w-full flex-col gap-1 rounded-card border border-ink p-2 transition-colors focus-within:border-cta">
                      <label htmlFor="phone" className="text-xs font-bold text-ink transition-colors group-focus-within:text-cta">
                        {t.phone}
                      </label>
                      <div className="flex items-center gap-4">
                        <PhonePrefixSelect
                          value={customer.country}
                          onChange={(code) => setCustomer((c) => ({ ...c, country: code }))}
                          lang={lang}
                          searchPlaceholder={t.searchCountry}
                          noResults={t.noResults}
                        />
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          value={customer.phone}
                          onChange={set("phone")}
                          className="w-full flex-1 border-0 bg-transparent p-0 text-base font-medium leading-[22px] text-ink outline-none"
                        />
                      </div>
                    </div>
                  </fieldset>
                  {loggedInUser && (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      className="self-start"
                      onClick={() => setEditContact(false)}
                    >
                      {t.save}
                    </Button>
                  )}
                </>
              )}

              {/* Invoice toggle (Figma checkbox node 221:92) */}
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={invoiceOn}
                  disabled={locked}
                  onChange={(e) => setInvoiceOn(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="flex size-7 shrink-0 items-center justify-center rounded-card border border-cta text-white peer-checked:bg-cta peer-focus-visible:ring-2 peer-focus-visible:ring-cta/40">
                  {invoiceOn && (
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
                <span className="text-base text-ink">{t.invoiceQuestion}</span>
              </label>

              {invoiceOn && (
                <fieldset disabled={locked} className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FloatingInput
                      id="inv-name"
                      required={invoiceOn}
                      label={t.invoiceName}
                      value={invoice.name}
                      onChange={setInv("name")}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FloatingInput
                      id="inv-tax"
                      required={invoiceOn}
                      label={t.invoiceTaxId}
                      value={invoice.taxId}
                      onChange={setInv("taxId")}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FloatingInput
                      id="inv-address"
                      label={t.invoiceAddress}
                      value={invoice.address}
                      onChange={setInv("address")}
                    />
                  </div>
                  <div>
                    <FloatingInput
                      id="inv-city"
                      label={t.invoiceCity}
                      value={invoice.city}
                      onChange={setInv("city")}
                    />
                  </div>
                  <div>
                    <FloatingInput
                      id="inv-zip"
                      label={t.invoiceZip}
                      value={invoice.zip}
                      onChange={setInv("zip")}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <CountrySelect
                      id="inv-country"
                      label={t.country}
                      value={invoice.country}
                      onChange={(code) => setInvoice((v) => ({ ...v, country: code }))}
                      lang={lang}
                    />
                  </div>
                </fieldset>
              )}
            </section>
            </>
            )}

            {/* Participants (Figma node 76:15637) */}
            {hasPax && (
              <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-extrabold text-ink">{t.participantsTitle}</h2>
                <p className="text-sm text-ink/70">{t.participantsNote}</p>
                <div className="flex flex-col gap-6">
                  {paxGroups.map((g) => (
                    <div key={g.itemId} className="flex flex-col gap-4">
                      {/* mini tour card */}
                      <div className="flex w-full gap-6">
                        {g.itemImage && (
                          <span className="relative w-[108px] shrink-0 self-stretch overflow-hidden rounded-panel">
                            <Image
                              src={g.itemImage}
                              alt=""
                              fill
                              sizes="108px"
                              className="object-cover"
                            />
                          </span>
                        )}
                        <div className="flex min-w-0 flex-1 flex-col gap-4">
                          <p className="text-base font-bold text-ink">{g.itemTitle}</p>
                          <p className="text-base text-ink">{g.itemDate}</p>
                        </div>
                      </div>
                      <hr className="border-stroke-2" />
                      {g.slots.map((s) => (
                        <fieldset key={s.id} disabled={locked} className="flex flex-col gap-4">
                          <p className="text-base font-bold text-ink">{s.label}</p>
                          <FloatingInput
                            id={`pf-${s.id}`}
                            label={t.firstName}
                            autoComplete="off"
                            value={pax[s.id]?.firstName ?? "Mario"}
                            onChange={(e) => setPaxField(s.id, "firstName", e.target.value)}
                          />
                          <FloatingInput
                            id={`pl-${s.id}`}
                            label={t.lastName}
                            autoComplete="off"
                            value={pax[s.id]?.lastName ?? "Rossi"}
                            onChange={(e) => setPaxField(s.id, "lastName", e.target.value)}
                          />
                        </fieldset>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-card bg-badge/10 px-4 py-3 text-sm font-semibold text-badge"
              >
                {error}
              </p>
            )}

            {/* CTA → payment (Figma node 76:15772) */}
            <section className="flex flex-col gap-4">
              <Button type="button" onClick={goToPayment} variant="primary" size="lg" fullWidth>
                {t.continueToPayment}
              </Button>
              <p className="text-sm text-ink">{t.paymentSubtitle}</p>
              <CancellationBox title={dict.booking.freeCancellation} />
            </section>
          </>
        ) : (
          <>
            {/* Step 2 — ordine Figma "Checkout/ pagamento/ Mobile" 76:16092:
                metodo pagamento → riepilogo (con Dati di contatto) → partecipanti. */}
            {/* Seleziona un metodo di pagamento — titolo FUORI dalla card (Figma 76:16092). */}
            <section className="flex flex-col gap-3">
              <h2 className="text-2xl font-extrabold text-ink">{t.payment.methodsTitle}</h2>

              {agency && !addingNewMethod ? (
                /* Agenzia: metodo salvato (predefinito selezionato) + "Cambia metodo
                   di pagamento" → lista degli altri metodi salvati / "Aggiungi nuovo". */
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3 rounded-panel border border-soft-grey bg-white p-4">
                    <div className="flex items-center gap-3">
                      <RadioDot on />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-ink">
                          {selectedSavedMethod?.label}
                        </span>
                        {selectedSavedMethod?.detail && (
                          <span className="block text-sm text-ink/60">{selectedSavedMethod.detail}</span>
                        )}
                      </span>
                      {selectedSavedMethod?.isDefault && (
                        <span className="shrink-0 rounded-full bg-soft px-2 py-0.5 text-xs font-bold text-ink/60">
                          {t.agency.defaultBadge}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setMethodPickerOpen((o) => !o)}
                      aria-expanded={methodPickerOpen}
                      className="self-start text-sm font-bold text-cta hover:underline"
                    >
                      {t.agency.changeMethod}
                    </button>
                    {methodPickerOpen && (
                      <div className="flex flex-col gap-1 border-t border-soft-grey pt-3">
                        {agency.paymentMethods.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setSavedMethodId(m.id);
                              setMethodPickerOpen(false);
                            }}
                            className="flex items-center gap-3 rounded-card px-2 py-2 text-left hover:bg-soft/50"
                          >
                            <RadioDot on={m.id === savedMethodId} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium text-ink">{m.label}</span>
                              {m.detail && (
                                <span className="block text-sm text-ink/60">{m.detail}</span>
                              )}
                            </span>
                            {m.isDefault && (
                              <span className="shrink-0 text-xs font-bold text-ink/50">
                                {t.agency.defaultBadge}
                              </span>
                            )}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setAddingNewMethod(true);
                            setMethodPickerOpen(false);
                          }}
                          className="flex items-center gap-3 rounded-card px-2 py-2 text-left text-sm font-bold text-cta hover:bg-soft/50"
                        >
                          <span className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-cta text-base leading-none">
                            +
                          </span>
                          {t.agency.addNewMethod}
                        </button>
                      </div>
                    )}
                  </div>
                  {/* ponytail: preview pay button per il metodo salvato; in produzione il
                      submit con metodo salvato salta il form Redsys (token su file) — wiring full-stack #44. */}
                  <Button type="submit" disabled={submitting || locked} variant="primary" size="lg" fullWidth>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
                      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {submitting ? t.processing : t.payment.payNow}
                  </Button>
                  <p className="text-center text-sm font-bold text-cta">{t.payment.secureEncrypted}</p>
                </div>
              ) : (
              <>
              {agency && (
                <button
                  type="button"
                  onClick={() => setAddingNewMethod(false)}
                  className="self-start text-sm font-bold text-cta hover:underline"
                >
                  {t.agency.useSavedMethod}
                </button>
              )}
              {/* Card unica = fisarmonica a 2 voci (Carta / PayPal), radio esclusivo: aprendo
                  una, l'altra si chiude. Righe edge-to-edge (niente box-bottone). */}
              <div className="overflow-hidden rounded-panel border border-soft-grey bg-white">
                {/* — Carta di credito o debito — */}
                <button
                  type="button"
                  onClick={() => setMethod("card")}
                  disabled={locked}
                  aria-expanded={method === "card"}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left disabled:opacity-60"
                >
                  <RadioDot on={method === "card"} />
                  <span className="flex-1 font-bold text-ink">{t.payment.card}</span>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink/50" aria-hidden>
                    <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M2.5 9.5h19" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </button>
                <AnimatePresence initial={false}>
                  {method === "card" && (
                    <motion.div
                      key="card-panel"
                      className="overflow-hidden"
                      initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                      exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={reduceMotion ? { duration: 0 } : { duration: duration.base, ease: ease.standard }}
                    >
                  <div className="flex flex-col gap-4 px-4 pb-5">
                    {phase.step === "paying" ? (
                      <div>
                        <p className="text-sm text-ink/50">{t.payment.loadingForm}</p>
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
                      <p className="flex items-center gap-3 rounded-card bg-soft px-4 py-3 text-sm font-semibold text-ink">
                        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-cta border-t-transparent" aria-hidden />
                        {t.payment.processing}
                      </p>
                    ) : phase.step === "challenge" ? (
                      <div>
                        <div className="rounded-card border border-stroke bg-soft/40 px-4 py-4">
                          <p className="font-bold text-ink">{t.payment.challengeTitle}</p>
                          <p className="mt-1 text-sm text-ink/70">{t.payment.challengeBody}</p>
                        </div>
                        <RedsysChallengeFrame acsURL={phase.acsURL} creq={phase.creq} />
                        <p className="mt-3 flex items-center gap-3 text-sm font-semibold text-ink/70">
                          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-cta border-t-transparent" aria-hidden />
                          {t.payment.challengeWaiting}
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* MOCKUP/PREVIEW: campi carta solo VISIVI (Figma). Cattura reale = Redsys
                            InSite (iframe PCI); questi valori NON vengono mai inviati. */}
                        <FloatingInput
                          id="mock-card-number"
                          label={t.cardNumber}
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder="1234 5678 9012 3456"
                          value={mockCard.number}
                          onChange={(e) => setMockCard((m) => ({ ...m, number: e.target.value }))}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FloatingInput
                            id="mock-card-exp"
                            label={t.cardExpiry}
                            autoComplete="off"
                            placeholder="MM/AA"
                            value={mockCard.exp}
                            onChange={(e) => setMockCard((m) => ({ ...m, exp: e.target.value }))}
                          />
                          <FloatingInput
                            id="mock-card-cvc"
                            label={t.cardCvc}
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="***"
                            value={mockCard.cvc}
                            onChange={(e) => setMockCard((m) => ({ ...m, cvc: e.target.value }))}
                          />
                        </div>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={mockCard.save}
                            onChange={(e) => setMockCard((m) => ({ ...m, save: e.target.checked }))}
                            className="peer sr-only"
                          />
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-card border border-cta text-white peer-checked:bg-cta peer-focus-visible:ring-2 peer-focus-visible:ring-cta/40">
                            {mockCard.save && (
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
                          <span className="text-base text-ink">{t.payment.saveDetails}</span>
                        </label>
                        <Button type="submit" disabled={submitting} variant="primary" size="lg" fullWidth>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
                            <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          {submitting ? t.processing : t.payment.payNow}
                        </Button>
                        <p className="text-center text-sm font-bold text-cta">{t.payment.secureEncrypted}</p>
                        <p className="flex items-start gap-2 text-xs text-ink/70">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-cta" aria-hidden>
                            <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          <span>{t.payment.continueTerms}</span>
                        </p>
                      </>
                    )}
                  </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <hr className="border-soft-grey" />

                {/* — PayPal — */}
                <button
                  type="button"
                  onClick={() => setMethod("paypal")}
                  disabled={locked}
                  aria-expanded={method === "paypal"}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left disabled:opacity-60"
                >
                  <RadioDot on={method === "paypal"} />
                  <span className="flex-1 font-bold text-ink">{t.payment.paypal}</span>
                  <span aria-hidden style={{ color: PAYPAL_FG }} className="text-sm font-extrabold italic">
                    PayPal
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {method === "paypal" && (
                    <motion.div
                      key="paypal-panel"
                      className="overflow-hidden"
                      initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                      exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={reduceMotion ? { duration: 0 } : { duration: duration.base, ease: ease.standard }}
                    >
                  <div className="flex flex-col gap-3 px-4 pb-5">
                    {/* MOCKUP/PREVIEW: CTA PayPal solo VISIVA — il bottone+popup reali = SDK PayPal. */}
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{ backgroundColor: PAYPAL_BG, color: PAYPAL_FG }}
                      className="flex h-12 w-full items-center justify-center rounded-card text-lg font-extrabold italic disabled:opacity-60"
                    >
                      PayPal
                    </button>
                    <p className="text-center text-sm font-bold text-cta">{t.payment.secureEncrypted}</p>
                  </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </>
              )}
            </section>

            {/* Fatturazione (agenzia) — card stile "Dati di contatto": ragione sociale,
                indirizzo, P. IVA. "Modifica" → profilo. */}
            {agency && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-extrabold text-ink">{t.agency.billingTitle}</h2>
                  {!locked && (
                    <Link
                      href={profileHref}
                      className="shrink-0 text-sm font-bold text-cta hover:underline"
                    >
                      {t.edit}
                    </Link>
                  )}
                </div>
                <div className="flex flex-col gap-1 rounded-card border border-soft-grey bg-white p-4 text-base text-ink">
                  <p className="font-bold">{agency.billing.legalName}</p>
                  <p>{agency.billing.address}</p>
                  <p>
                    {t.agency.vatLabel} {agency.billing.vatId}
                  </p>
                </div>
              </section>
            )}

            {/* Riepilogo ordine — SOTTO il metodo di pagamento (Figma 76:16092). */}
            {orderSummary}

            {/* Dati di contatto — review o editing INLINE: "Modifica" rende i campi
                compilabili + mostra "Salva", senza tornare allo step 1 (Figma 76:16092).
                Agenzia: card read-only "Dati agenzia", "Modifica" → profilo. */}
            {agency ? (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-extrabold text-ink">{t.agency.contactTitle}</h2>
                  {!locked && (
                    <Link
                      href={profileHref}
                      className="shrink-0 text-sm font-bold text-cta hover:underline"
                    >
                      {t.edit}
                    </Link>
                  )}
                </div>
                <div className="flex flex-col gap-1 rounded-card border border-soft-grey bg-white p-4 text-base text-ink">
                  <p className="font-bold">{agency.name}</p>
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="min-w-0 break-all">{agency.email}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-cta">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path
                          d="M8 12.5l2.5 2.5L16 9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {t.emailVerified}
                    </span>
                  </p>
                  {agency.phone && (
                    <p>
                      {DIAL[agency.phonePrefix] ?? ""} {agency.phone}
                    </p>
                  )}
                </div>
              </section>
            ) : (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-extrabold text-ink">{t.reviewContactTitle}</h2>
                {!locked && !editContact && (
                  <button
                    type="button"
                    onClick={() => setEditContact(true)}
                    className="shrink-0 text-sm font-bold text-cta hover:underline"
                  >
                    {t.edit}
                  </button>
                )}
              </div>
              {editContact ? (
                <div className="flex flex-col gap-4">
                  <FloatingInput
                    id="r-email"
                    type="email"
                    autoComplete="email"
                    label={t.email}
                    value={customer.email}
                    onChange={set("email")}
                  />
                  <FloatingInput
                    id="r-firstName"
                    autoComplete="given-name"
                    label={t.firstName}
                    value={customer.firstName}
                    onChange={set("firstName")}
                  />
                  <FloatingInput
                    id="r-lastName"
                    autoComplete="family-name"
                    label={t.lastName}
                    value={customer.lastName}
                    onChange={set("lastName")}
                  />
                  <div className="group flex w-full flex-col gap-1 rounded-card border border-ink p-2 transition-colors focus-within:border-cta">
                    <label htmlFor="r-phone" className="text-xs font-bold text-ink transition-colors group-focus-within:text-cta">
                      {t.phone}
                    </label>
                    <div className="flex items-center gap-4">
                      <PhonePrefixSelect
                        value={customer.country}
                        onChange={(code) => setCustomer((c) => ({ ...c, country: code }))}
                        lang={lang}
                        searchPlaceholder={t.searchCountry}
                        noResults={t.noResults}
                      />
                      <input
                        id="r-phone"
                        type="tel"
                        autoComplete="tel"
                        value={customer.phone}
                        onChange={set("phone")}
                        className="w-full flex-1 border-0 bg-transparent p-0 text-base font-medium leading-[22px] text-ink outline-none"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    className="self-start"
                    onClick={() => setEditContact(false)}
                  >
                    {t.save}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-1 rounded-card border border-soft-grey bg-white p-4 text-base text-ink">
                  <p className="font-bold">
                    {`${customer.firstName} ${customer.lastName}`.trim() || "—"}
                  </p>
                  <p className="flex flex-wrap items-center gap-2">
                    <span>{customer.email || "—"}</span>
                    {customer.email && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-cta">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                          <path
                            d="M8 12.5l2.5 2.5L16 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {t.emailVerified}
                      </span>
                    )}
                  </p>
                  {customer.phone && (
                    <p>
                      {DIAL[customer.country] ?? ""} {customer.phone}
                    </p>
                  )}
                </div>
              )}
            </section>
            )}

            {/* Partecipanti — review o editing INLINE: "Modifica" → campi compilabili + "Salva". */}
            {hasPax && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-extrabold text-ink">{t.participantsTitle}</h2>
                  {!locked && !editPax && (
                    <button
                      type="button"
                      onClick={() => setEditPax(true)}
                      className="shrink-0 text-sm font-bold text-cta hover:underline"
                    >
                      {t.edit}
                    </button>
                  )}
                </div>
                {editPax ? (
                  <div className="flex flex-col gap-6">
                    {paxGroups.map((g) => (
                      <div key={g.itemId} className="flex flex-col gap-4">
                        <p className="text-base font-bold text-ink">{g.itemTitle}</p>
                        {g.slots.map((s) => (
                          <div key={s.id} className="flex flex-col gap-4">
                            <p className="text-sm font-bold text-ink/70">{s.label}</p>
                            <FloatingInput
                              id={`r-pf-${s.id}`}
                              label={t.firstName}
                              autoComplete="off"
                              value={pax[s.id]?.firstName ?? "Mario"}
                              onChange={(e) => setPaxField(s.id, "firstName", e.target.value)}
                            />
                            <FloatingInput
                              id={`r-pl-${s.id}`}
                              label={t.lastName}
                              autoComplete="off"
                              value={pax[s.id]?.lastName ?? "Rossi"}
                              onChange={(e) => setPaxField(s.id, "lastName", e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      className="self-start"
                      onClick={() => setEditPax(false)}
                    >
                      {t.save}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 rounded-card border border-soft-grey bg-white p-4">
                    {paxGroups.map((g) => (
                      <div key={g.itemId} className="flex flex-col gap-2">
                        <p className="text-sm font-bold text-ink/70">{g.itemTitle}</p>
                        <ul className="flex flex-col gap-1">
                          {g.slots.map((s) => {
                            const name = `${pax[s.id]?.firstName ?? "Mario"} ${
                              pax[s.id]?.lastName ?? "Rossi"
                            }`.trim();
                            return (
                              <li
                                key={s.id}
                                className="flex justify-between gap-3 text-base text-ink"
                              >
                                <span className="text-ink/60">{s.label}</span>
                                <span className="font-medium">{name || "—"}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Promo code (honestly gated — no client-side discount) */}
            <section className="rounded-panel border border-soft-grey bg-white p-5 sm:p-6">
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
                  className="shrink-0 rounded-card bg-ink px-5 font-extrabold text-white transition-colors hover:bg-ink/90 disabled:opacity-60"
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

            {/* Totals */}
            <div className="border-t border-soft-grey pt-4">
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
                className="rounded-card bg-badge/10 px-4 py-3 text-sm font-semibold text-badge"
              >
                {error}
              </p>
            )}

          </>
        )}
      </form>
    </Container>
    <LoginModal
      lang={lang}
      dict={dict}
      open={loginOpen}
      onClose={() => setLoginOpen(false)}
    />
    </>
  );
}
