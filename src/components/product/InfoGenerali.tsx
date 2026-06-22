import Image from "next/image";

import type { InfoRow } from "@/data/product";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** "Informazioni Generali" — key facts rows with icons. Figma 64:10128. */
export function InfoGenerali({ rows, dict }: { rows: InfoRow[]; dict: Dictionary }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-extrabold text-ink sm:text-2xl lg:text-3xl">{dict.product.infoTitle}</h2>
      <ul className="flex flex-col gap-4">
        {rows.map((row) => (
          <li key={row.title} className="flex items-start gap-2">
            <Image
              src={row.icon}
              alt=""
              width={30}
              height={30}
              className="mt-0.5 shrink-0"
            />
            <div className="flex flex-col gap-2">
              <p className="font-bold text-ink">{row.title}</p>
              <p className="text-sm font-medium leading-[22px] text-ink">{row.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
