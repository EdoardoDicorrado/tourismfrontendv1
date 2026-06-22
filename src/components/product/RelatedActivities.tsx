import { CardSlider } from "@/components/ui/CardSlider";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/home/ProductCard";
import { listingProducts } from "@/data/listing";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Altre attività su {city}" — related tours as a horizontal card slider, the
 * same look as the homepage "Tour in offerta" (`Offers` + `CardSlider`). Unlike
 * the home offers it stays a slider at EVERY breakpoint (cards keep a fixed
 * width, no `sm:` grid collapse) so it always scrolls. Figma 64:10723.
 */
export function RelatedActivities({
  cityName,
  lang,
  dict,
}: {
  cityName: string;
  lang: Locale;
  dict: Dictionary;
}) {
  const related = listingProducts.slice(0, 9);

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">
          {fill(dict.product.related, { city: cityName })}
        </h2>
        {/* Always-on slider: full-bleed on mobile (-mx-4 + px-4), contained from
            sm (mx-0/px-0) but still flex/overflow — never a static grid. */}
        <CardSlider
          label={dict.common.nextCard}
          className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:px-0"
        >
          {related.map((p) => (
            <li key={p.id} className="w-[267px] shrink-0 snap-start">
              <ProductCard product={p} lang={lang} dict={dict} />
            </li>
          ))}
        </CardSlider>
      </Container>
    </section>
  );
}
