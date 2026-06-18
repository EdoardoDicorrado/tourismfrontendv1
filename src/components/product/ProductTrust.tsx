import Image from "next/image";

import { trustFeatures } from "@/data/home";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** "Perchè piace ai nostri clienti" — reuses the homepage trust features. Figma 64:10363. */
export function ProductTrust({ dict }: { dict: Dictionary }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-ink sm:text-2xl">{dict.product.trustTitle}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {trustFeatures.map((f) => (
          <div key={f.title} className="flex flex-col gap-2 rounded-[10px] bg-soft p-4">
            <Image src={f.icon} alt="" width={32} height={32} />
            <p className="font-bold text-ink">{f.title}</p>
            <p className="text-sm text-ink/70">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
