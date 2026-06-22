"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import type { BookingOption, ParticipantType, ProductDetail, TimeSlot } from "@/data/product";
import { duration, ease, stagger } from "@/lib/motion/tokens";
import { Spinner } from "@/components/ui/Spinner";
import { ensureMinSlots } from "@/lib/booking/slots";
import { isoDate, monthIndexFromLabel } from "@/lib/calendar";
import { DateField } from "@/components/selectors/DateField";
import { ParticipantsField } from "@/components/selectors/ParticipantsField";
import { Button } from "@/components/ui/Button";
import type { Counts } from "@/components/selectors/ParticipantsSelector";
import { CheckCircle } from "@/components/selectors/glyphs";
import { useCart } from "@/lib/cart/CartContext";
import { useToast } from "@/lib/toast/ToastContext";
import type { CartItem } from "@/lib/cart/types";
import { formatDateLong, formatMoney } from "@/lib/format";
import { AGENCY_DISCOUNT_PERCENT, agencyPrice } from "@/lib/account/agency-pricing";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useBooking } from "@/components/product/BookingContext";

/** Earliest bookable day (mock "today" — matches CLAUDE.md currentDate). */
const TODAY_ISO = "2026-06-08";

/**
 * Entrata delle opzioni dopo "Verifica disponibilità": il contenitore orchestra
 * uno stagger, ogni figlio (conteggio + card) sale con un fade. Sotto
 * `prefers-reduced-motion` il MotionProvider droppa la `y` e tiene solo l'opacity.
 */
const optionsContainer = {
  show: { transition: { staggerChildren: stagger.children, delayChildren: 0.04 } },
};
const optionItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.entrance } },
};

/** Cart glyph (currentColor → inherits the button's white). Figma "Prenota ora" trailing icon. */
function CartIcon() {
  return (
    <svg width="32" height="32" viewBox="1 2 20 20" fill="none" aria-hidden>
      <path
        d="M2 3h2.3l1.7 11.3a2 2 0 0 0 2 1.7h8a2 2 0 0 0 2-1.6L19.7 7H6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.6" fill="currentColor" />
      <circle cx="17" cy="20" r="1.6" fill="currentColor" />
    </svg>
  );
}

/** Plain check — confirmation glyph the cart button shows after an item is added. */
function Check() {
  return (
    <svg width="32" height="32" viewBox="4 4 16 16" fill="none" aria-hidden>
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Two-step booking widget. Step 1: participants + date → verify. Step 2: pick option + slot → book. Figma 64:9732 / 64:13027. */
export function BookingBox({
  product,
  lang,
  dict,
  isAgency = false,
}: {
  product: ProductDetail;
  lang: Locale;
  dict: Dictionary;
  /** Logged-in agency → show the agency price (struck public price + red agency price + badge). */
  isAgency?: boolean;
}) {
  const startYear = product.calendar.year;
  const startMonth = monthIndexFromLabel(product.calendar.monthLabel);
  const pricing = {
    basePrice: product.calendar.basePrice,
    lowPrice: product.calendar.lowPrice,
    discountPercent: product.calendar.discountPercent,
  };

  // counts/date sono CONDIVISI via context: su desktop le opzioni vivono nella
  // colonna principale (ProductOptions) e devono riflettere la selezione del box.
  const { counts, date, setCount, setDate } = useBooking();
  const [step, setStep] = useState<"select" | "options">("select");
  const reduceMotion = useReducedMotion();
  // Inizio del blocco opzioni: target dello scroll dopo "Verifica disponibilità".
  const optionsRef = useRef<HTMLDivElement>(null);

  function verify() {
    // Fall back to a known-available day so we never default to a sold-out date.
    if (!date) setDate(isoDate(startYear, startMonth, 15));
    setStep("options");
  }

  // Dopo "Verifica disponibilità": scroll morbido all'INIZIO del blocco opzioni
  // (così il conteggio "N opzioni disponibili" resta in cima e la prima opzione è
  // appena sotto). Durante l'anchor BLOCCHIAMO lo scroll utente (wheel/touch) finché
  // non finisce, così non lo interrompe. reduced-motion → salto istantaneo, niente lock.
  useEffect(() => {
    if (step !== "options") return;
    const el = optionsRef.current;
    if (!el) return;
    // Su DESKTOP le opzioni inline sono nascoste (lg:hidden) — vivono nella colonna
    // principale (ProductOptions). offsetParent === null = nascosto → niente anchor/lock.
    if (el.offsetParent === null) return;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (reduceMotion) return;

    const block = (e: Event) => e.preventDefault();
    const opts: AddEventListenerOptions = { passive: false };
    window.addEventListener("wheel", block, opts);
    window.addEventListener("touchmove", block, opts);
    const release = () => {
      window.removeEventListener("wheel", block, opts);
      window.removeEventListener("touchmove", block, opts);
      window.removeEventListener("scrollend", release);
      clearTimeout(fallback);
    };
    // `scrollend` segna la fine dell'anchor; fallback ~900ms se il browser non lo emette.
    const fallback = setTimeout(release, 900);
    window.addEventListener("scrollend", release);
    return release;
  }, [step, reduceMotion]);

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile: pannello soft azzurro. Desktop (lg+, colonna destra): CARD BIANCA
          con bordo + ombra leggera (richiesta Edoardo). Solo additivo lg:*. */}
      <div id="prenota" className="scroll-mt-24 rounded-panel bg-soft p-5 sm:p-6 lg:border lg:border-soft-grey lg:bg-white lg:shadow-sm">
        {isAgency ? (
          // Agenzia loggata: badge "Sconto X% agenzia", prezzo pubblico barrato, prezzo
          // agenzia grande in rosso. Centrato quando NON c'è un altro badge sconto;
          // se c'è product.badge, layout a riga col badge prodotto a destra.
          // (ponytail: sconto fisso 20%, vedi agency-pricing.)
          <div
            className={
              product.badge
                ? "flex items-start justify-between gap-3"
                : "flex flex-col items-center gap-1 text-center"
            }
          >
            <div className={`flex flex-col gap-1 ${product.badge ? "items-start" : "items-center"}`}>
              <span className="rounded-badge bg-badge px-2 py-1 text-xs font-extrabold text-white">
                {fill(dict.booking.agencyDiscount, { percent: String(AGENCY_DISCOUNT_PERCENT) })}
              </span>
              <p className="text-ink">
                <span className="text-base text-ink/60">
                  {dict.booking.from}{" "}
                  <span className="line-through">
                    {product.priceFrom}
                    {product.currency}
                  </span>
                </span>
                <br />
                <span className="text-3xl font-extrabold text-badge">
                  {agencyPrice(product.priceFrom)}
                  {product.currency}
                </span>{" "}
                <span className="text-sm text-ink/70">{dict.booking.perPerson}</span>
              </p>
            </div>
            {product.badge && (
              <span className="shrink-0 rounded-badge bg-badge px-2 py-1 text-xs font-extrabold text-white">
                {product.badge}
              </span>
            )}
          </div>
        ) : product.oldPrice ? (
          // Scontato: "Da {oldPrice}" barrato sopra, prezzo grande in rosso, badge a destra (invariato).
          <div className="flex items-start justify-between gap-3">
            <p className="text-ink">
              <span className="text-base text-ink/60">
                {dict.booking.from}{" "}
                <span className="line-through">{product.oldPrice}{product.currency}</span>
              </span>
              <br />
              <span className="text-3xl font-extrabold text-badge">
                {product.priceFrom}
                {product.currency}
              </span>{" "}
              <span className="text-sm text-ink/70">{dict.booking.perPerson}</span>
            </p>
            {product.badge && (
              <span className="shrink-0 rounded-badge bg-badge px-2 py-1 text-xs font-extrabold text-white">
                {product.badge}
              </span>
            )}
          </div>
        ) : (
          // Senza sconto: "da {prezzo}€ a persona" in linea, prezzo grande in NERO, centrato (non full-width), niente badge.
          <p className="text-center text-ink">
            <span className="mr-2 text-lg font-bold text-ink/70">{dict.booking.from}</span>
            <span className="text-3xl font-extrabold text-ink">
              {product.priceFrom}
              {product.currency}
            </span>{" "}
            <span className="text-lg font-bold text-ink/70">{dict.booking.perPerson}</span>
          </p>
        )}

        {/* Selettori partecipanti+data: restano nel box anche in step "options",
            mostrando la selezione (Figma 64:13109). Il bottone "Verifica" appare
            solo in "select"; in "options" le opzioni compaiono SOTTO il box. */}
        <div className="mt-5 flex flex-col gap-3">
          <h2 className="text-center text-2xl font-extrabold leading-snug text-ink">
            {dict.booking.selectTitle}
          </h2>

          <ParticipantsField
            participants={product.participants}
            counts={counts}
            onChange={setCount}
            placeholder={dict.booking.participantsPlaceholder}
            selectorLabels={dict.booking.participants}
            confirmLabel={dict.booking.confirm}
          />

          <DateField
            value={date}
            onChange={setDate}
            pricing={pricing}
            startYear={startYear}
            startMonth={startMonth}
            minIso={TODAY_ISO}
            lang={lang}
            placeholder={dict.booking.datePlaceholder}
            calendarLabels={dict.booking.calendar}
            confirmLabel={dict.booking.confirm}
          />

          {step === "select" && (
            <Button type="button" onClick={verify} size="md" fullWidth className="mt-1 gap-2">
              {dict.booking.checkAvailability}
              <CheckCircle />
            </Button>
          )}
        </div>
      </div>

      {step === "options" && (
        // Fuori dal box soft (Figma 64:13128 + 64:13556): conteggio opzioni + card,
        // su sfondo pagina. gap-8 = 32px (≈ wrapper 16px sopra+sotto di ogni card).
        // Entra in stagger (fade+slide-up) all'apparire dopo "Verifica disponibilità".
        <motion.div
          ref={optionsRef}
          // scroll-mt-24: l'anchor lascia ~96px sopra → il conteggio non finisce
          // sotto l'header sticky e resta sempre visibile.
          // lg:hidden → su DESKTOP le opzioni stanno nella colonna principale
          // (ProductOptions), non qui sotto il box; il flow inline resta solo mobile.
          className="flex scroll-mt-24 flex-col gap-8 lg:hidden"
          variants={optionsContainer}
          initial="hidden"
          animate="show"
        >
          <motion.p variants={optionItem} className="text-xl font-extrabold text-ink">
            {fill(dict.booking.optionsAvailable, { count: String(product.options.length) })}
          </motion.p>
          {product.options.map((opt) => (
            <motion.div key={opt.id} variants={optionItem}>
              <OptionCard
                option={opt}
                counts={counts}
                participants={product.participants}
                product={product}
                date={date ?? isoDate(startYear, startMonth, 15)}
                lang={lang}
                dict={dict}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export function OptionCard({
  option,
  counts,
  participants,
  product,
  date,
  lang,
  dict,
}: {
  option: BookingOption;
  counts: Counts;
  participants: ParticipantType[];
  product: ProductDetail;
  date: string;
  lang: Locale;
  dict: Dictionary;
}) {
  const router = useRouter();
  const { addItem, openCart, items } = useCart();
  const { toast } = useToast();

  // Live availability for this variant (option) on the chosen date, via the BFF.
  // Tagged with the request key so a stale response (date changed mid-flight) is
  // ignored at render — no synchronous reset effect needed.
  const availabilityKey = `${product.slug}|${option.id}|${date}`;
  const [live, setLive] = useState<{ key: string; slots: TimeSlot[] } | null>(null);
  // Key of the last availability request that SETTLED (success or null/404). `loading`
  // is DERIVED from it (no synchronous setState in the effect body): a request is in
  // flight whenever the settled key isn't the current one — true on first render and
  // right after the deps change, without resetting any state by hand.
  const [settledKey, setSettledKey] = useState<string | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    const key = `${product.slug}|${option.id}|${date}`;
    const url = `/api/availability/${encodeURIComponent(product.slug)}?variant=${encodeURIComponent(
      option.id,
    )}&date=${encodeURIComponent(date)}&lang=${lang}`;
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { slots?: TimeSlot[] | null } | null) => {
        // Adopt a real array only; on null / not-live keep the placeholder slots.
        if (data && Array.isArray(data.slots)) setLive({ key, slots: data.slots });
      })
      .catch(() => {
        /* network/abort → keep placeholder */
      })
      .finally(() => {
        // The abort (date changed mid-flight) leaves "loading" to the new request.
        if (!ctrl.signal.aborted) setSettledKey(key);
      });
    return () => ctrl.abort();
  }, [product.slug, option.id, date, lang]);

  const loading = settledKey !== availabilityKey;

  // Spinner RITARDATO: compare solo se il fetch "ci mette" (>200ms), così una
  // risposta veloce o un 404 (API backend-pending) non fa lampeggiare l'icona. Si
  // ACCENDE nel timer (>200ms) e si SPEGNE nel CLEANUP (quando `loading` cambia o si
  // smonta) → nessun setState sincrono nel corpo dell'effect (react-hooks rule).
  const [showSpinner, setShowSpinner] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setShowSpinner(true), 200);
    return () => {
      clearTimeout(t);
      setShowSpinner(false);
    };
  }, [loading]);

  // `null` = API not live / not loaded for THIS key → placeholder; `[]` = real empty day.
  const liveSlots = live && live.key === availabilityKey ? live.slots : null;
  // ⚠️ DEMO: pad to ≥ MIN_SLOTS so every product stays bookable through to
  // checkout (see MIN_SLOTS). Drop `ensureMinSlots` to restore the empty-day state.
  const slots: TimeSlot[] = ensureMinSlots(liveSlots ?? option.slots);

  // Selected slot: the user's explicit pick while still bookable, else the first
  // bookable slot. Derived during render so it auto-reconciles as availability
  // loads — no state-syncing effect.
  const [picked, setPicked] = useState<string | null>(null);
  const [descOpen, setDescOpen] = useState(false);
  // After adding to cart the icon button shows a confirmation check — but only for the
  // slot it was added for, so picking a different time reverts it to the cart icon.
  const [addedSlot, setAddedSlot] = useState<string | null>(null);
  const slot =
    picked && slots.some((s) => s.time === picked && !s.soldOut)
      ? picked
      : (slots.find((s) => !s.soldOut)?.time ?? "");
  // True only while the currently-selected slot is the one added to the cart.
  const added = addedSlot === slot;

  const activeSlot = slots.find((s) => s.time === slot);
  const discount = activeSlot?.discount ?? 0;
  // Per-slot prices (real availability) override the option's base prices.
  const priceFor = (key: string): number =>
    activeSlot?.prices?.[key] ?? activeSlot?.prices?.[key.toLowerCase()] ?? option.prices[key] ?? 0;

  const lines = participants
    .filter((p) => counts[p.key] > 0)
    .map((p) => ({
      key: p.key,
      label: counts[p.key] === 1 ? p.label : p.labelPlural,
      qty: counts[p.key],
      unitPrice: priceFor(p.key),
    }));

  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  const total = subtotal * (1 - discount / 100);
  const canBook = !!activeSlot && !activeSlot.soldOut && lines.length > 0;

  function buildItem(): CartItem {
    return {
      id: `${product.city}/${product.slug}|${option.id}|${date}|${slot}`,
      productKey: `${product.city}/${product.slug}`,
      city: product.city,
      slug: product.slug,
      title: product.title,
      image: product.gallery[0]?.src ?? "",
      optionId: option.id,
      optionTitle: option.title,
      date,
      slot,
      // Real backend slot id when availability is live; "" keeps the order in
      // preview (the backend rejects an empty slot once /checkout is real).
      slotId: activeSlot?.slotId ?? "",
      currency: product.currency,
      discountPercent: discount,
      lines,
      total,
      // Product meta → checkout/confirmation summary chips (so they show real
      // per-tour data instead of the preview constants).
      rating: product.rating,
      features: option.bullets,
      cancellationNote: option.freeCancellation,
    };
  }

  /** Add to cart WITHOUT leaving the page → confirmation toast (top); tap it to open the drawer. */
  function addToCart() {
    if (!canBook) return;
    addItem(buildItem());
    setAddedSlot(slot);
    toast({
      variant: "success",
      duration: 2000,
      message: (
        <button
          type="button"
          onClick={openCart}
          className="block w-full text-left font-bold text-ink hover:underline"
        >
          {dict.booking.addedToCart}
        </button>
      ),
    });
  }

  /** Book now → add the item, then proceed: straight to checkout for a single item,
   *  or to the cart page when the cart already holds others (so they're reviewed first). */
  function book() {
    if (!canBook) return;
    const item = buildItem();
    addItem(item);
    const hasOthers = items.some((i) => i.id !== item.id);
    router.push(hasOthers ? `/${lang}/carrello` : `/${lang}/checkout`);
  }

  return (
    <article className="flex flex-col gap-6 rounded-panel border border-cta bg-white px-4 py-6">
      {/* Title + language flag (Figma node 64:13666) */}
      <div className="flex items-start justify-between gap-6">
        <h3 className="flex-1 text-xl font-extrabold leading-tight text-ink">{option.title}</h3>
        {option.flag && (
          <Image
            src={option.flag}
            alt=""
            width={35}
            height={35}
            unoptimized
            className="size-[35px] shrink-0 rounded-full object-cover ring-1 ring-black/10"
          />
        )}
      </div>

      {/* Review excerpt + show-all (Figma node 64:13607): troncato a 2 righe;
          "Mostra tutto" espande la descrizione completa. */}
      <div className="flex flex-col gap-2 text-ink">
        <p className={`text-sm font-medium leading-6 ${descOpen ? "" : "line-clamp-2"}`}>
          {option.description}
        </p>
        <button
          type="button"
          onClick={() => setDescOpen((v) => !v)}
          aria-expanded={descOpen}
          className="self-start text-base font-bold underline"
        >
          {descOpen ? dict.product.showLess : dict.product.showMore}
        </button>
      </div>

      {/* Feature bullets (Figma node 64:13650): gap 16px su entrambe le direzioni. */}
      <div className="flex flex-wrap gap-4">
        {option.bullets.map((b) => (
          <span key={b} className="flex items-center gap-2">
            <span className="size-[11px] shrink-0 rounded-full bg-cta" aria-hidden />
            <span className="text-sm font-medium leading-6 text-ink">{b}</span>
          </span>
        ))}
      </div>

      <hr className="border-stroke-2" />

      {/* Time slots + price (Figma node 64:13683) */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xl font-extrabold text-ink">{dict.booking.selectTime}</p>
          <p className="text-base font-medium text-ink">{formatDateLong(date, lang)}</p>
        </div>

        {showSpinner ? (
          // Loading disponibilità: icona animata centrata al posto della griglia slot.
          <div className="flex items-center justify-center py-8">
            <Spinner size={28} />
          </div>
        ) : (
        <div className="grid grid-cols-3 gap-2">
          {slots.map((s, i) => {
            const on = s.time === slot;
            return (
              <button
                key={`${s.time}-${i}`}
                type="button"
                onClick={() => !s.soldOut && setPicked(s.time)}
                disabled={s.soldOut}
                aria-pressed={on}
                className={`relative flex flex-col items-center justify-center rounded-card border p-2 text-xl font-medium transition ${
                  s.soldOut
                    ? "cursor-not-allowed border-soft bg-soft text-ink/40 line-through"
                    : on
                      ? "border-soft bg-cta text-white"
                      : "border-soft bg-soft text-ink hover:bg-soft-active"
                }`}
              >
                {s.time}
                {s.soldOut ? (
                  <span className="text-sm font-semibold no-underline">{dict.booking.soldOut}</span>
                ) : s.discount ? (
                  <>
                    <span className="text-sm font-bold">-{s.discount}%</span>
                    <span className="absolute -right-1 -top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-badge text-[10px] font-bold text-white">
                      %
                    </span>
                  </>
                ) : null}
              </button>
            );
          })}
        </div>
        )}

        {/* Price — strikethrough original + discount label when a discounted slot is picked. */}
        <div className="flex flex-col gap-2">
          {discount > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-medium text-ink/50 line-through">
                {formatMoney(subtotal, lang)}
              </span>
              <span className="text-2xl font-extrabold text-ink">{formatMoney(total, lang)}</span>
              <span className="text-base font-bold text-badge">
                {fill(dict.booking.discountOff, { percent: String(discount) })}
              </span>
            </div>
          ) : (
            <p className="text-2xl font-extrabold text-ink">{formatMoney(total, lang)}</p>
          )}
          {lines.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {lines.map((l, i) => (
                <span key={l.key} className="flex items-center gap-2">
                  {i > 0 && <span className="size-[5px] shrink-0 rounded-full bg-ink" aria-hidden />}
                  <span className="text-sm font-medium leading-6 text-ink">
                    {`${l.qty} ${l.label} x ${formatMoney(l.unitPrice, lang)}`}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <hr className="border-stroke-2" />

      {/* Prenota ora (testo) + bottone carrello QUADRATO 56×56 (h-14 w-14), stessa
          altezza della CTA (Figma "Prenota ora" py-16). Dopo l'aggiunta mostra il
          check; cambiando orario torna l'icona del carrello. */}
      <div className="flex items-stretch gap-2">
        <Button
          type="button"
          onClick={book}
          disabled={!canBook}
          variant="primary"
          size="md"
          className="h-14 flex-1"
        >
          {dict.booking.bookNow}
        </Button>
        <Button
          type="button"
          onClick={addToCart}
          disabled={!canBook}
          variant="outline"
          size="md"
          aria-label={added ? dict.booking.addedToCart : dict.booking.addToCart}
          className="h-14 w-14 shrink-0 p-0!"
        >
          {added ? <Check /> : <CartIcon />}
        </Button>
      </div>

      {/* Cancellazione gratuita — stile OPZIONE (Figma 233:15142): piatta, senza
          sfondo verde (il box verde resta nel checkout). Icona money-receive 41px. */}
      <div className="flex items-center gap-4 text-ink">
        <Image
          src="/images/icon-money-receive.svg"
          alt=""
          width={41}
          height={41}
          unoptimized
          className="size-[41px] shrink-0"
        />
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold">{dict.booking.freeCancellation}</p>
          <p className="text-sm font-medium">{option.freeCancellation}</p>
        </div>
      </div>
    </article>
  );
}
