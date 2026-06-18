"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { BookingOption, ParticipantType, ProductDetail, TimeSlot } from "@/data/product";
import { isoDate, monthIndexFromLabel } from "@/lib/calendar";
import { DateField } from "@/components/selectors/DateField";
import { ParticipantsField } from "@/components/selectors/ParticipantsField";
import { Button } from "@/components/ui/Button";
import type { Counts } from "@/components/selectors/ParticipantsSelector";
import { CheckCircle, Chevron } from "@/components/selectors/glyphs";
import { useCart } from "@/lib/cart/CartContext";
import type { CartItem } from "@/lib/cart/types";
import { formatDateLong, formatMoney } from "@/lib/format";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Earliest bookable day (mock "today" — matches CLAUDE.md currentDate). */
const TODAY_ISO = "2026-06-08";

/** Two-step booking widget. Step 1: participants + date → verify. Step 2: pick option + slot → book. Figma 64:9732 / 64:13027. */
export function BookingBox({
  product,
  lang,
  dict,
}: {
  product: ProductDetail;
  lang: Locale;
  dict: Dictionary;
}) {
  const startYear = product.calendar.year;
  const startMonth = monthIndexFromLabel(product.calendar.monthLabel);
  const pricing = {
    basePrice: product.calendar.basePrice,
    lowPrice: product.calendar.lowPrice,
    discountPercent: product.calendar.discountPercent,
  };

  const initial = Object.fromEntries(
    product.participants.map((p) => [p.key, p.min]),
  ) as Counts;

  const [counts, setCounts] = useState<Counts>(initial);
  const [date, setDate] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "options">("select");

  const setCount = (key: ParticipantType["key"], delta: number) =>
    setCounts((prev) => {
      const min = product.participants.find((p) => p.key === key)?.min ?? 0;
      return { ...prev, [key]: Math.max(min, prev[key] + delta) };
    });

  function verify() {
    // Fall back to a known-available day so we never default to a sold-out date.
    if (!date) setDate(isoDate(startYear, startMonth, 15));
    setStep("options");
  }

  return (
    <div id="prenota" className="scroll-mt-24 rounded-[15px] bg-soft p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-ink">
          {product.oldPrice && (
            <span className="text-base text-ink/60">
              {dict.booking.from}{" "}
              <span className="line-through">{product.oldPrice}{product.currency}</span>
            </span>
          )}
          <br />
          <span className="text-3xl font-extrabold text-badge">
            {product.priceFrom}
            {product.currency}
          </span>{" "}
          <span className="text-sm text-ink/70">{dict.booking.perPerson}</span>
        </p>
        {product.badge && (
          <span className="shrink-0 rounded-[5px] bg-badge px-2 py-1 text-xs font-extrabold text-white">
            {product.badge}
          </span>
        )}
      </div>

      {step === "select" ? (
        <div className="mt-5 flex flex-col gap-3">
          <h2 className="text-center text-xl font-extrabold leading-snug text-ink">
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

          <Button
            type="button"
            onClick={verify}
            size="md"
            fullWidth
            className="mt-1 gap-2"
          >
            {dict.booking.checkAvailability}
            <CheckCircle />
          </Button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setStep("select")}
            className="flex items-center gap-2 self-start text-sm font-bold text-cta"
          >
            <Chevron dir="left" />
            {dict.booking.back}
          </button>
          <p className="text-sm font-semibold text-ink">
            {fill(dict.booking.optionsAvailable, { count: String(product.options.length) })}
          </p>
          {product.options.map((opt) => (
            <OptionCard
              key={opt.id}
              option={opt}
              counts={counts}
              participants={product.participants}
              product={product}
              date={date ?? isoDate(startYear, startMonth, 15)}
              lang={lang}
              dict={dict}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OptionCard({
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
  const { addItem } = useCart();

  // Live availability for this variant (option) on the chosen date, via the BFF.
  // Tagged with the request key so a stale response (date changed mid-flight) is
  // ignored at render — no synchronous reset effect needed.
  const availabilityKey = `${product.slug}|${option.id}|${date}`;
  const [live, setLive] = useState<{ key: string; slots: TimeSlot[] } | null>(null);
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
      });
    return () => ctrl.abort();
  }, [product.slug, option.id, date, lang]);

  // `null` = API not live / not loaded for THIS key → placeholder; `[]` = real empty day.
  const liveSlots = live && live.key === availabilityKey ? live.slots : null;
  const slots: TimeSlot[] = liveSlots ?? option.slots;
  const realEmpty = liveSlots !== null && liveSlots.length === 0;

  // Selected slot: the user's explicit pick while still bookable, else the first
  // bookable slot. Derived during render so it auto-reconciles as availability
  // loads — no state-syncing effect.
  const [picked, setPicked] = useState<string | null>(null);
  const slot =
    picked && slots.some((s) => s.time === picked && !s.soldOut)
      ? picked
      : (slots.find((s) => !s.soldOut)?.time ?? "");

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

  function book() {
    if (!canBook) return;
    const item: CartItem = {
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
    };
    addItem(item);
    router.push(`/${lang}/carrello`);
  }

  return (
    <article className="flex flex-col gap-3 rounded-[15px] border border-stroke-2 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-extrabold leading-snug text-ink">{option.title}</h3>
        {option.flag && (
          <Image
            src={option.flag}
            alt=""
            width={28}
            height={28}
            className="mt-1 shrink-0 rounded-full"
          />
        )}
      </div>

      <p className="text-sm text-ink/70">
        {option.description}{" "}
        <button type="button" className="font-bold text-ink underline">
          {dict.booking.showAll}
        </button>
      </p>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-cta">
        {option.bullets.map((b) => (
          <li key={b} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cta" />
            {b}
          </li>
        ))}
      </ul>

      <div className="border-t border-soft-grey pt-3">
        <p className="font-bold text-ink">{dict.booking.selectTime}</p>
        <p className="text-sm text-ink/60">{formatDateLong(date, lang)}</p>
        {realEmpty ? (
          <p className="mt-2 text-sm font-semibold text-ink/60">{dict.booking.noAvailabilityDay}</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {slots.map((s) => {
              const on = s.time === slot;
              return (
                <button
                  key={s.time}
                  type="button"
                  onClick={() => !s.soldOut && setPicked(s.time)}
                  disabled={s.soldOut}
                  aria-pressed={on}
                  className={`relative rounded-[10px] px-4 py-2 text-sm font-bold transition ${
                    s.soldOut
                      ? "cursor-not-allowed bg-soft text-ink/40 line-through"
                      : on
                        ? "bg-cta text-white"
                        : "bg-soft text-ink hover:bg-soft/70"
                  }`}
                >
                  {s.time}
                  {s.soldOut ? (
                    <span className="block text-[10px] font-semibold no-underline">
                      {dict.booking.soldOut}
                    </span>
                  ) : (
                    s.discount && (
                      <>
                        <span className="block text-[10px] font-semibold">-{s.discount}%</span>
                        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-badge text-[9px] font-bold text-white">
                          %
                        </span>
                      </>
                    )
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-extrabold text-ink">{formatMoney(total, lang)}</p>
        <p className="text-sm text-ink/60">
          {lines.map((l) => `${l.qty} ${l.label} x ${formatMoney(l.unitPrice, lang)}`).join("  ·  ")}
        </p>
      </div>

      <Button
        type="button"
        onClick={book}
        disabled={!canBook}
        size="md"
        fullWidth
        className="gap-2"
      >
        {dict.booking.bookNow}
        <CheckCircle />
      </Button>

      <p className="flex items-center gap-2 text-xs text-ink/70">
        <Image src="/images/icon-cancellation.svg" alt="" width={20} height={20} />
        <span>
          <strong className="font-bold text-ink">{dict.booking.freeCancellation}</strong>
          <br />
          {option.freeCancellation}
        </span>
      </p>
    </article>
  );
}
