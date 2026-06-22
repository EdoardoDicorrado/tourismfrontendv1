"use client";

import { OptionCard } from "@/components/product/BookingBox";
import { useBooking } from "@/components/product/BookingContext";
import { isoDate, monthIndexFromLabel } from "@/lib/calendar";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { ProductDetail } from "@/data/product";

/**
 * Lista opzioni della scheda prodotto per la COLONNA PRINCIPALE su DESKTOP — sotto
 * la descrizione breve (Figma 221:8186), sempre visibile, separata dal box di destra
 * ("Verifica disponibilità"). Legge `counts`/`date` dal {@link useBooking} context
 * (condivisi col BookingBox), così prezzi e disponibilità riflettono la selezione del
 * box. Su MOBILE non si usa: lì le opzioni restano inline nel BookingBox (flow
 * congelato), quindi questa va resa `hidden lg:block` dal chiamante.
 */
export function ProductOptions({
  product,
  lang,
  dict,
  className = "",
}: {
  product: ProductDetail;
  lang: Locale;
  dict: Dictionary;
  className?: string;
}) {
  const { counts, date } = useBooking();
  // OptionCard pretende una data: finché l'utente non sceglie nel box, usa lo stesso
  // fallback del BookingBox (giorno 15 del mese di partenza del calendario).
  const fallbackDate =
    date ?? isoDate(product.calendar.year, monthIndexFromLabel(product.calendar.monthLabel), 15);

  return (
    <div className={`flex flex-col gap-8 ${className}`}>
      <p className="text-xl font-extrabold text-ink lg:text-xl">
        {fill(dict.booking.optionsAvailable, { count: String(product.options.length) })}
      </p>
      {product.options.map((opt) => (
        <OptionCard
          key={opt.id}
          option={opt}
          counts={counts}
          participants={product.participants}
          product={product}
          date={fallbackDate}
          lang={lang}
          dict={dict}
        />
      ))}
    </div>
  );
}
