import Image from "next/image";

import { Container } from "@/components/ui/Container";
import type { Attraction } from "@/data/listing";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Attrazioni più popolari" — attraction cards. Figma node 221:2806.
 * Data comes from the storefront API (with fixture fallback) via the page.
 */
export function Attractions({ dict, attractions }: { dict: Dictionary; attractions: Attraction[] }) {
  return (
    <section className="py-8 sm:py-12">
      <Container>
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">
          {dict.attractions.title}
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {attractions.map((a) => (
            <article
              key={a.slug}
              className="flex h-full flex-col overflow-hidden rounded-[10px] border border-stroke-2 bg-white"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={a.image}
                  alt={a.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="text-xl font-extrabold text-ink">{a.name}</h3>
                <p className="text-sm text-ink/80">{a.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
