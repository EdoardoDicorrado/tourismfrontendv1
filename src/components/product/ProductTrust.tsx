import Image from "next/image";

import { trustFeatures } from "@/data/home";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** "Perchè piace ai nostri clienti" — reuses the homepage trust features. Figma 64:10363. */
export function ProductTrust({ dict }: { dict: Dictionary }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-extrabold text-ink sm:text-2xl">{dict.product.trustTitle}</h2>
      {/* Mobile: full-bleed horizontal scroll-snap slider, first card inset 16px
          and the next peeking — identical to the homepage `TrustBar` (Figma
          64:11867, w-[311px]). sm+: 3-up grid fallback (desktop is a later phase). */}
      <ul className="-mx-4 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {trustFeatures.map((f) => (
          <li
            key={f.title}
            className="flex w-[311px] shrink-0 snap-start items-start gap-4 overflow-clip rounded-[10px] bg-soft p-4 sm:w-auto"
          >
            <Image src={f.icon} alt="" width={44} height={44} className="shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="font-semibold text-ink">{f.title}</p>
              <p className="text-sm font-medium text-ink">{f.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
