"use client";

import { CardSlider } from "@/components/ui/CardSlider";
import { ListingResultCard } from "@/components/listing/ListingResultCard";
import { useDemoUser } from "@/lib/auth/demoUser";
import { useRecentlyViewed } from "@/lib/recentlyViewed";
import type { Product } from "@/data/home";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Sei ancora interessato a:" — the last tours the user looked at, GetYourGuide-style,
 * rendered INSIDE the hero, right below the social-proof line (white title on the
 * dark backdrop). The caller (Hero) supplies the Container; this returns the bare
 * block so it sits in the hero's content column.
 *
 * The list is the REAL per-browser view history ({@link useRecentlyViewed}, recorded
 * on each product-detail open); the most recent 3 are shown. Gated to a (demo)
 * signed-in user per the design — bind it to the real session/tracking once auth
 * lands. Horizontal listing cards in the same slider as the offers row (mobile) /
 * a 3-up grid (sm+).
 */
export function RecentlyViewed({
  lang,
  dict,
  products,
}: {
  lang: Locale;
  dict: Dictionary;
  /** Catalogo tour reale: filtra le voci stale della cronologia (es. una vecchia
   *  "Villa Adriana" non più in catalogo) e completa la riga con tour esistenti. */
  products: Product[];
}) {
  const user = useDemoUser();
  const history = useRecentlyViewed();
  // Tieni solo lo storico ancora presente in catalogo, poi completa coi tour reali
  // (in offerta) così la riga mostra sempre tour esistenti e mai voci fantasma.
  const known = history.filter((h) => products.some((p) => p.id === h.id));
  const fillers = products.filter((p) => !known.some((k) => k.id === p.id));
  const items = [...known, ...fillers].slice(0, 3);
  // Only for a signed-in user (per request) — and never an empty row.
  if (!user || items.length === 0) return null;

  return (
    <>
      {/* With the recently-viewed row the hero content extends upward, where the
          Hero's bottom-up gradient is near-transparent → poor contrast. Lay a
          stronger gradient (listing-style, never transparent) over the image,
          above the image/base-gradient (-z-10) but below the content. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/50 to-black/35"
      />
      <div data-recently-viewed className="w-full">
        <h2 className="text-2xl font-extrabold text-white">{dict.home.stillInterested}</h2>
      <CardSlider
        label={dict.common.nextCard}
        className="no-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0"
      >
        {items.map((product) => (
          <li key={product.id} className="w-[300px] shrink-0 snap-start sm:w-auto">
            <ListingResultCard product={product} lang={lang} dict={dict} onDark />
          </li>
        ))}
      </CardSlider>
      </div>
    </>
  );
}
