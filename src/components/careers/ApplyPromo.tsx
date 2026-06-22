import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Rich } from "@/components/partner/Rich";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Invia la tua candidatura" promo card — pixel-perfect to Figma "Lavora con Noi
 * // Mobile" (447:1471): a stacked card with two gecko mascots over a circular
 * backdrop on the cta-blue band, then a soft panel (title + copy with bold runs +
 * the "Vai al modulo" button → the standalone spontaneous-application page).
 */
export function ApplyPromo({ lang, dict }: { lang: Locale; dict: Dictionary["careers"] }) {
  const t = dict.apply;
  return (
    <section className="py-4">
      <Container>
        <div className="overflow-hidden rounded-card">
          <div className="relative flex h-[214px] items-end justify-center overflow-hidden bg-cta">
            <Image
              src="/images/gecko-ellipse-bg.svg"
              alt=""
              width={265}
              height={265}
              className="absolute left-1/2 top-1/2 size-[265px] max-w-none -translate-x-1/2 -translate-y-1/2"
            />
            <Image
              src="/images/gecko-request.png"
              alt=""
              width={150}
              height={200}
              unoptimized
              className="relative -mr-5 h-[170px] w-auto"
            />
            <Image
              src="/images/gecko.png"
              alt=""
              width={200}
              height={250}
              unoptimized
              className="relative h-[206px] w-auto"
            />
          </div>
          <div className="flex flex-col gap-4 bg-soft p-4">
            <h2 className="text-2xl font-extrabold text-ink">{t.title}</h2>
            <div className="flex flex-col gap-4 text-sm leading-[1.3] text-ink">
              {t.body.map((paragraph) => (
                <p key={paragraph}>
                  <Rich text={paragraph} />
                </p>
              ))}
            </div>
            <Link
              href={`/${lang}/lavora-con-noi/candidatura`}
              className="flex w-full items-center justify-center rounded-card bg-cta py-4 text-base font-bold text-white transition-colors hover:bg-cta-hover active:bg-cta-active"
            >
              {t.cta}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
