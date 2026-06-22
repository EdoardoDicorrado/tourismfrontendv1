import Link from "next/link";

import { Container } from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Posizioni aperte" — open-roles list, pixel-perfect to Figma "Lavora con Noi //
 * Mobile" (447:1489). Each soft card carries an anchor (`#position-<id>`) so the
 * hero search can scroll to it, and a "Candidati ora" link to the standalone
 * application page pre-filled with that position. The search lives in its own
 * section under the hero ({@link CareersSearch}). Positions are dictionary data
 * for now (no careers API yet).
 */
export function OpenPositions({ lang, dict }: { lang: Locale; dict: Dictionary["careers"] }) {
  const t = dict.positions;
  const hasPositions = t.items.length > 0;
  const applyHref = (id?: string) =>
    `/${lang}/lavora-con-noi/candidatura${id ? `?posizione=${id}` : ""}`;

  return (
    <section id="posizioni-aperte" className="scroll-mt-4 py-4">
      <Container className="flex flex-col gap-4">
        <h2 className="text-2xl font-extrabold text-ink">{t.title}</h2>

        {!hasPositions ? (
          <div className="rounded-card bg-soft p-4 text-base font-semibold text-ink">{t.empty}</div>
        ) : (
          <ul className="flex flex-col gap-4">
            {t.items.map((position) => (
              <li
                key={position.id}
                id={`position-${position.id}`}
                className="flex scroll-mt-4 flex-col gap-2 rounded-card bg-soft p-4"
              >
                <p className="text-xs font-semibold uppercase text-cta">{position.category}</p>
                <p className="text-base font-extrabold text-ink">{position.title}</p>
                <p className="text-xs font-medium leading-[1.3] text-ink">{position.location}</p>
                <Link
                  href={applyHref(position.id)}
                  className="text-base font-extrabold text-cta hover:underline"
                >
                  {t.apply}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* LinkedIn note (shown in both states) */}
        <div className="flex flex-col gap-4 text-ink">
          <p className="text-base font-extrabold">{t.linkedinTitle}</p>
          <p className="text-base font-medium">
            {t.linkedinBefore}
            <a
              href={t.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold underline hover:text-cta"
            >
              {t.linkedinLabel}
            </a>
            {t.linkedinAfter}
          </p>
        </div>

        {/* Empty state → spontaneous application CTA */}
        {!hasPositions && (
          <Link
            href={applyHref()}
            className="flex w-full items-center justify-center rounded-card bg-cta py-4 text-base font-bold text-white transition-colors hover:bg-cta-hover active:bg-cta-active"
          >
            {t.spontaneousCta}
          </Link>
        )}
      </Container>
    </section>
  );
}
