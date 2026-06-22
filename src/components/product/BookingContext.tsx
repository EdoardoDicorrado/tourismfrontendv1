"use client";

import { createContext, useContext, useState } from "react";

import type { ParticipantType, ProductDetail } from "@/data/product";
import type { Counts } from "@/components/selectors/ParticipantsSelector";

/**
 * Stato di prenotazione condiviso tra il BookingBox (selettori partecipanti/data,
 * colonna destra su desktop) e la lista opzioni. Su DESKTOP le opzioni vivono nella
 * colonna principale sotto la descrizione breve (`ProductOptions`), separate dal box
 * → devono leggere gli STESSI `counts`/`date` del box, da qui il context. Su mobile
 * il flow resta tutto dentro il BookingBox (vedi quello).
 */
type BookingState = {
  counts: Counts;
  date: string | null;
  setCount: (key: ParticipantType["key"], delta: number) => void;
  setDate: (date: string | null) => void;
};

const BookingContext = createContext<BookingState | null>(null);

export function BookingProvider({
  product,
  children,
}: {
  product: ProductDetail;
  children: React.ReactNode;
}) {
  const [counts, setCounts] = useState<Counts>(
    () => Object.fromEntries(product.participants.map((p) => [p.key, p.min])) as Counts,
  );
  const [date, setDate] = useState<string | null>(null);

  const setCount = (key: ParticipantType["key"], delta: number) =>
    setCounts((prev) => {
      const min = product.participants.find((p) => p.key === key)?.min ?? 0;
      return { ...prev, [key]: Math.max(min, prev[key] + delta) };
    });

  return (
    <BookingContext.Provider value={{ counts, date, setCount, setDate }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingState {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within a BookingProvider");
  return ctx;
}
