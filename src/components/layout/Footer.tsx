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
  const linkColumns = dict.footer.columns.slice(0, 3); // Azienda, Destinazioni, Collabora con noi

  return (
    <footer id="site-footer" className="bg-cta text-white">
      <Container className="flex flex-col gap-6 py-8">
        {/* Language */}
        <div className="flex flex-col gap-3">
          <span className="text-xl font-extrabold">{dict.language.label}</span>
          <LanguageSwitcher current={lang} variant="footer" />
        </div>

        {/* Collapsible link sections */}
        {linkColumns.map((col) => (
          <FooterSection key={col.title} title={col.title}>
            <ul className="flex flex-col gap-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={`/${lang}${link.href}`}
                    className="block px-2 font-bold text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>
        ))}

        {/* Payment methods (collapsible) */}
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
          <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {Array.from({ length: 4 }, (_, i) => (
              <li
                key={i}
                className="flex h-20 w-24 shrink-0 items-center justify-center rounded-[5px] bg-white"
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

        {/* TEMP (Edoardo): scorciatoie di accesso rapido per la demo — RIMUOVERE poi. */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/20 pt-4 text-sm font-bold">
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
        <Container className="flex flex-col gap-4 py-6">
          <div className="flex items-center justify-between gap-4">
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
            className="h-auto w-full max-w-full opacity-90"
          />

          <p className="text-center text-sm">© 2026 Tourismotion</p>
          <p className="text-center text-xs text-white/80">
            <Link href={`/${lang}/cookie-policy`} className="hover:underline">
              Privacy policy
            </Link>{" "}
            -{" "}
            <Link href={`/${lang}/reso`} className="hover:underline">
              Termini e condizioni
            </Link>
          </p>
        </Container>
      </div>
    </footer>
  );
}
