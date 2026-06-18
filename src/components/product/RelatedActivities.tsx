import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/home/ProductCard";
import { listingProducts } from "@/data/listing";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** "Altre attività su {city}" — related tours grid. Figma 64:10723. */
export function RelatedActivities({
  cityName,
  lang,
  dict,
}: {
  cityName: string;
  lang: Locale;
  dict: Dictionary;
}) {
  const related = listingProducts.slice(0, 3);

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">
          {fill(dict.product.related, { city: cityName })}
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} lang={lang} dict={dict} />
          ))}
        </div>
      </Container>
    </section>
  );
}
