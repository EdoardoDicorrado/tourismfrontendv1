"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Disclosure } from "@/components/ui/Disclosure";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Agency support page body (`/[lang]/agenzie/assistenza`). Three blocks:
 *  (a) "chat with an operator" request form (preview: submit → success, no
 *      backend yet — real endpoint POST /api/agency/support = full-stack #60),
 *  (b) FAQ via the {@link Disclosure} primitive (canonical accordion motion),
 *  (c) phone-support contacts (real numbers come from marketing #59 / Edoardo).
 */
export function AgencySupportView({
  dict,
}: {
  dict: Dictionary["account"]["agencySupport"];
}) {
  const [sent, setSent] = useState(false);

  // ponytail: preview submit, no network. Swap to POST /api/agency/support when full-stack #60 lands.
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{dict.title}</h1>
        <p className="text-ink/70">{dict.subtitle}</p>
      </header>

      {/* (a) Chatta con un operatore / invia richiesta */}
      <section className="flex flex-col gap-4 rounded-panel border border-soft-grey bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-extrabold text-ink">{dict.formTitle}</h2>
          <p className="text-sm text-ink/70">{dict.formNote}</p>
        </div>
        {sent ? (
          <div className="flex items-start gap-3 rounded-card bg-cta/10 p-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-cta" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path
                d="M8 12.5l2.5 2.5L16 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="font-bold text-ink">{dict.successTitle}</p>
              <p className="text-sm text-ink/70">{dict.successBody}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field
              id="support-subject"
              name="subject"
              required
              label={dict.subjectLabel}
              placeholder={dict.subjectPlaceholder}
            />
            <Field
              id="support-contact"
              name="contact"
              type="email"
              required
              autoComplete="email"
              label={dict.contactLabel}
              placeholder={dict.contactPlaceholder}
            />
            <div>
              <label htmlFor="support-message" className="mb-1 block text-sm font-bold text-ink">
                {dict.messageLabel}
              </label>
              <Textarea
                id="support-message"
                name="message"
                required
                rows={5}
                placeholder={dict.messagePlaceholder}
              />
            </div>
            <Button type="submit" variant="primary" size="lg" fullWidth>
              {dict.submit}
            </Button>
          </form>
        )}
      </section>

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
