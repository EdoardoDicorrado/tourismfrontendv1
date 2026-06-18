import Image from "next/image";

import { buttonVariants } from "@/components/ui/buttonVariants";
import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Invia la tua candidatura" promo card — the intro the hero / position CTAs
 * scroll to (`#candidatura`). Its button points to the form below (`#modulo`).
 * Figma node 447:1471.
 */
export function ApplyPromo({ dict }: { dict: Dictionary["careers"] }) {
  const t = dict.apply;
  return (
    <section id="candidatura" className="scroll-mt-8 py-12 sm:py-16">
      <Container>
        <div className="overflow-hidden rounded-[15px] border border-soft-grey">
          <div className="grid md:grid-cols-2">
            <div className="flex items-center justify-center bg-cta px-6 py-10">
              <Image
                src="/images/support-illustration.svg"
                alt=""
                width={220}
                height={220}
                className="h-auto w-auto max-w-[220px]"
              />
            </div>
            <div className="flex flex-col gap-4 bg-soft p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.title}</h2>
              {t.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-ink/90 sm:text-base">
                  {paragraph}
                </p>
              ))}
              <a href="#modulo" className={`mt-2 ${buttonVariants({ size: "lg" })}`}>
                {t.cta}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
