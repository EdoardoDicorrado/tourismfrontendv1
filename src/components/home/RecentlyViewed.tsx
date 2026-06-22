"use client";

import { CardSlider } from "@/components/ui/CardSlider";
import { Container } from "@/components/ui/Container";
import { ListingResultCard } from "@/components/listing/ListingResultCard";
import { useDemoUser } from "@/lib/auth/demoUser";
import { useRecentlyViewed } from "@/lib/recentlyViewed";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Sei ancora interessato a:" — the last tours the user looked at, GetYourGuide-style,
 * just below the hero.
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
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const user = useDemoUser();
  const items = useRecentlyViewed().slice(0, 3);
  // Only for a signed-in user (per request) — and never an empty row.
  if (!user || items.length === 0) return null;

  return (
    <section className="py-3 sm:py-8">
      <Container>
        <h2 className="text-2xl font-extrabold text-ink">{dict.home.stillInterested}</h2>
        <CardSlider
          label={dict.common.nextCard}
          className="no-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0"
        >
          {items.map((product) => (
            <li key={product.id} className="w-[300px] shrink-0 snap-start sm:w-auto">
              <ListingResultCard product={product} lang={lang} dict={dict} />
            </li>
          ))}
        </CardSlider>
      </Container>
    </section>
  );
}
