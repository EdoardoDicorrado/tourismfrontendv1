import Image from "next/image";

import { Container } from "@/components/ui/Container";
import type { AgenciesCopy } from "@/lib/i18n/dictionaries/agencies";

/** Audience-chip icon per item, matched by index to `audience.items`. */
const ICONS = [
  "/images/icon-agenzie-viaggio.svg",
  "/images/icon-consulenti-viaggio.svg",
  "/images/icon-travel-designer.svg",
  "/images/icon-tour-operator.svg",
  "/images/icon-professionisti-turismo.svg",
];

/** "A chi è rivolto?" — 5 audience chips. Figma 447:2858. */
export function AgenciesAudience({ t }: { t: AgenciesCopy }) {
  return (
    <section className="py-4">
      <Container className="flex flex-col gap-4">
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.audience.title}</h2>

        <ul className="grid grid-cols-2 gap-4">
          {t.audience.items.map((item, i) => (
            <li
              key={item.label}
              className="flex items-center justify-center gap-2 rounded-card bg-soft p-4 text-center last:col-span-2"
            >
              <Image
                src={ICONS[i]}
                alt=""
                width={42}
                height={42}
                unoptimized
                className="h-[42px] w-[42px] shrink-0"
              />
              <span className="text-base font-extrabold leading-tight text-ink">{item.label}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
