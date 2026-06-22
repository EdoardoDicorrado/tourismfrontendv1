"use client";

import { Disclosure } from "@/components/ui/Disclosure";
import { OpenRequestsButton } from "@/components/account/support/OpenRequestsButton";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Agency support page body (`/[lang]/agenzie/assistenza`). Three blocks:
 *  (a) chat entry — "Avvia una nuova chat" CTA + open-requests link
 *      ({@link OpenRequestsButton}); the chat lives on its own pages,
 *  (b) FAQ via the {@link Disclosure} primitive (canonical accordion motion),
 *  (c) phone-support contacts (real numbers come from marketing #59 / Edoardo).
 */
export function AgencySupportView({
  dict,
  basePath,
}: {
  dict: Dictionary["account"]["agencySupport"];
  /** Agency support base route, e.g. `/it/agenzie/assistenza`. */
  basePath: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{dict.title}</h1>
        <p className="text-ink/70">{dict.subtitle}</p>
      </header>

      {/* (a) Chat di assistenza — avvia una nuova chat o apri le richieste. */}
      <OpenRequestsButton audience="agency" basePath={basePath} />

      {/* (b) FAQ — Disclosure porta già la motion accordion canonica (no deposit animations) */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold text-ink">{dict.faqTitle}</h2>
        <div className="rounded-panel border border-soft-grey bg-white px-5">
          {dict.faq.map((item, i) => (
            <Disclosure key={item.q} summary={item.q} divided={i < dict.faq.length - 1}>
              <p className="pb-4 text-sm text-ink/70">{item.a}</p>
            </Disclosure>
          ))}
        </div>
      </section>

      {/* (c) Assistenza telefonica — recapiti reali da fornire (marketing #59 / Edoardo) */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold text-ink">{dict.phoneTitle}</h2>
        <div className="flex flex-col gap-3 rounded-panel border border-soft-grey bg-white p-5 sm:p-6">
          <p className="text-sm text-ink/70">{dict.phoneNote}</p>
          <dl className="flex flex-col gap-2 text-base text-ink">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink/60">{dict.phoneNumberLabel}</dt>
              <dd>
                <a
                  href={`tel:${dict.phoneNumber.replace(/\s/g, "")}`}
                  className="font-bold text-cta hover:underline"
                >
                  {dict.phoneNumber}
                </a>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink/60">{dict.phoneEmailLabel}</dt>
              <dd>
                <a href={`mailto:${dict.phoneEmail}`} className="font-bold text-cta hover:underline">
                  {dict.phoneEmail}
                </a>
              </dd>
            </div>
          </dl>
          <p className="text-sm text-ink/60">{dict.phoneHours}</p>
        </div>
      </section>
    </div>
  );
}
