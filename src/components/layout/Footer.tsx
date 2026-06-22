import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { FooterSection } from "@/components/layout/FooterSection";
import { paymentMethods, socialLinks } from "@/data/home";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Site footer. Figma node 55:277 — a teal panel where each section is an
 * accordion (title + chevron over a white separator), with the language
 * selector on top and a darker brand/social/copyright band at the bottom.
 */
export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  // Azienda, Destinazioni, Collabora con noi, Termini e condizioni (Privacy/Cookie/Reso).
  const linkColumns = dict.footer.columns;

  const renderLinks = (col: (typeof linkColumns)[number]) => (
    <ul className="flex flex-col gap-3 lg:gap-6">
      {col.links.map((link) => (
        // ponytail: key su label (unica per colonna), non href — il dict ha 2 link allo stesso /cookie-policy
        <li key={link.label}>
          <Link
            href={`/${lang}${link.href}`}
            className="block px-2 font-bold text-white hover:underline lg:text-lg"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <footer id="site-footer" className="bg-cta text-white">
      <Container className="flex flex-col gap-6 py-8 lg:flex-row lg:flex-wrap lg:items-start lg:gap-x-10 lg:gap-y-8 lg:py-12">
        {/* Language */}
        <div className="flex flex-col gap-3 lg:w-56 lg:shrink-0">
          <span className="text-xl font-extrabold">{dict.language.label}</span>
          <LanguageSwitcher current={lang} variant="footer" />
        </div>

        {/* Collapsible link sections — Azienda, Destinazioni: colonne singole. */}
        {linkColumns.slice(0, 2).map((col) => (
          <FooterSection key={col.title} title={col.title} className="lg:flex-1">
            {renderLinks(col)}
          </FooterSection>
        ))}

        {/* Collabora con noi + Termini e condizioni: su DESKTOP impilate nella STESSA
            colonna (Edoardo: "Termini e condizioni subito sotto Collabora con noi").
            Su mobile restano accordion separati e consecutivi via display:contents
            (il wrapper sparisce → ordine DOM invariato, mobile congelato). */}
        <div className="contents lg:flex lg:flex-1 lg:flex-col lg:gap-8">
          {linkColumns.slice(2).map((col) => (
            <FooterSection key={col.title} title={col.title}>
              {renderLinks(col)}
            </FooterSection>
          ))}
        </div>

        {/* Payments + certifications — grouped as the 4th desktop column (lg:flex-1) */}
        <div className="flex flex-col gap-6 lg:flex-1">
          {/* Payment methods (collapsible on mobile) */}
          <FooterSection title={dict.footer.payments}>
          <div className="flex flex-wrap items-center gap-2 px-2">
            {paymentMethods.map((src) => (
              <Image
                key={src}
                src={src}
                alt=""
                width={52}
                height={34}
                className="h-[34px] w-auto object-contain"
              />
            ))}
          </div>
        </FooterSection>

        {/* Certifications — slider (not collapsible) */}
        <div className="flex flex-col gap-3">
          <span className="text-xl font-extrabold">{dict.footer.certifications}</span>
          <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
            {Array.from({ length: 4 }, (_, i) => (
              <li
                key={i}
                className="flex h-20 w-24 shrink-0 items-center justify-center rounded-badge bg-white"
              >
                <Image
                  src="/images/cert-logo.png"
                  alt="Certificazione"
                  width={62}
                  height={62}
                  className="max-h-full max-w-full object-contain"
                />
              </li>
            ))}
          </ul>
        </div>

        </div>

        {/* TEMP (Edoardo): scorciatoie di accesso rapido per la demo — RIMUOVERE poi. */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/20 pt-4 text-sm font-bold lg:basis-full">
          <Link href={`/${lang}/agenzie/accedi`} className="hover:underline">
            Login agenzia
          </Link>
          <Link href={`/${lang}/affiliati/accedi`} className="hover:underline">
            Login affiliato
          </Link>
        </div>
      </Container>

      {/* Brand / social / copyright band */}
      <div className="bg-ink">
        <Container className="flex flex-col gap-4 py-6 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-6 lg:py-8">
          <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-start lg:gap-3">
            <Image
              src="/images/footer-logo.png"
              alt="TourisMotion"
              width={124}
              height={28}
              className="h-auto w-auto"
            />
            <div className="flex items-center gap-4">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center"
                >
                  {/* Dimensioni intrinseche reali (la "f" di Facebook è 1:2): h-6 w-auto
                      tiene l'altezza a 24px senza stirare la larghezza. */}
                  <Image src={s.icon} alt="" width={s.w} height={s.h} className="h-6 w-auto" />
                </a>
              ))}
            </div>
          </div>

          <Image
            src="/images/footer-image-4.png"
            alt=""
            width={354}
            height={62}
            className="h-auto w-full max-w-full opacity-90 lg:w-auto"
          />

          {/* Link legali (Privacy/Termini/Cookie/Reso) ora nella colonna
              "Termini e condizioni" del footer, non più qui in fondo. */}
          <p className="text-center text-sm lg:basis-full">© 2026 Tourismotion</p>
        </Container>
      </div>
    </footer>
  );
}
