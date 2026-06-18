import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { trustFeatures } from "@/data/home";

/**
 * Reassurance strip — feature cards on soft-blue. Figma node 1:855 (Trust 1).
 *
 * Geometry mirrors Figma 1:1: cards are 311px wide with 16px padding, a 10px
 * radius and `#def3fb` fill; 16px gap between icon and text, 8px between the
 * two text lines; title Raleway SemiBold 16px, body Raleway Medium 14px, both
 * in `--color-ink` (#36515c). Icons keep their exact per-glyph box size.
 *
 * Mobile: full-bleed horizontal scroll-snap slider (the next card peeks ~50px).
 * sm+: static 3-column grid.
 */
export function TrustBar() {
  return (
    <section className="py-3 sm:py-6">
      <Container>
        <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
          {trustFeatures.map((f) => (
            <li
              key={f.title}
              className="flex w-[311px] shrink-0 snap-start items-start gap-4 overflow-clip rounded-[10px] bg-soft p-4 sm:w-auto"
            >
              <Image
                src={f.icon}
                alt=""
                width={f.iconWidth}
                height={f.iconHeight}
                className="shrink-0"
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 leading-normal text-ink [word-break:break-word]">
                <h3 className="whitespace-nowrap text-base font-semibold">{f.title}</h3>
                <p className="text-sm font-medium">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
