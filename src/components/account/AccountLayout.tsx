import type { ReactNode } from "react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import type { Session } from "@/lib/account/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { BackLink } from "./BackLink";
import { type AccountNavKey } from "./AccountNav";

/**
 * Shell for every authenticated personal-area page (modelled on tatanka2's
 * `personal-area.php`): site Header/Footer, a "personal area" heading, then a
 * two-column grid with the role-aware {@link AccountNav} sidebar on the left and
 * page content on the right.
 *
 * Server component. The page is responsible for auth-gating with
 * `requireRole(role, lang)` BEFORE rendering this (redirect outside try/catch)
 * and for passing the resulting `session`; this layout only branches the menu by
 * `session.role`. `dict` is the FULL dictionary (Header/Footer need it);
 * `dict.account.*` drives the heading and nav. `active` highlights the current
 * sidebar entry.
 *
 * Usage:
 *   const g = await requireRole("agency", lang);
 *   if ("redirectTo" in g) redirect(g.redirectTo);
 *   return (
 *     <AccountLayout lang={lang} dict={dict} session={g.session} active="profile">
 *       … page content …
 *     </AccountLayout>
 *   );
 */
export function AccountLayout({
  lang,
  dict,
  children,
}: {
  lang: Locale;
  dict: Dictionary;
  /** Optional: the layout no longer renders a role-aware sidebar, so preview
   *  surfaces without a real server session (e.g. affiliate) can reuse it. */
  session?: Session;
  active?: AccountNavKey;
  children: ReactNode;
}) {
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1 bg-soft/30">
        <Container className="py-10 sm:py-14">
          {/* "Torna indietro" sopra il titolo della pagina (il titolo lo rende ogni
              pagina nel proprio heading). Niente più "Area riservata / nome utente":
              il titolo in cima è il nome della pagina corrente. */}
          <BackLink label={dict.account.nav.back} />

          {/* Sidebar nav removed (richiesta Edoardo): navigation now lives in the
              header hamburger drawer (UserMenu/AgencyMenu). Single-column content. */}
          <div className="min-w-0">{children}</div>
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
