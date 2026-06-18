import type { ReactNode } from "react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import type { Session } from "@/lib/account/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { AccountNav, type AccountNavKey } from "./AccountNav";

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
  session,
  active,
  children,
}: {
  lang: Locale;
  dict: Dictionary;
  session: Session;
  active?: AccountNavKey;
  children: ReactNode;
}) {
  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1 bg-soft/30">
        <Container className="py-10 sm:py-14">
          <header className="mb-8">
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{dict.account.nav.area}</h1>
            {session.name ? <p className="mt-1 text-ink/70">{session.name}</p> : null}
          </header>

          <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
            <aside>
              <AccountNav lang={lang} dict={dict.account} session={session} active={active} />
            </aside>
            <section className="min-w-0">{children}</section>
          </div>
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
