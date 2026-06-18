import Link from "next/link";

import type { Session } from "@/lib/account/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { LogoutButton } from "./LogoutButton";

/**
 * Role-aware sidebar for the personal area (modelled on tatanka2's
 * `personal-area.php`). Server component — the role comes from the decoded
 * session read server-side, so the menu is correct on first paint with no
 * client branching.
 *
 * - customer → only "Prenotazioni" (links to /area/prenotazioni)
 * - agency   → "Prenotazioni" (/agenzie/prenotazioni) + "Codici sconto" +
 *              "Amministrazione" (Profilo / Pagamento / Password)
 *
 * `active` highlights the current entry by its stable key (see {@link AccountNavKey}).
 * Logout lives at the bottom via the client {@link LogoutButton}.
 */
export type AccountNavKey =
  | "bookings"
  | "discountCodes"
  | "profile"
  | "payment"
  | "password";

interface NavLink {
  key: AccountNavKey;
  label: string;
  href: string;
}

interface NavGroup {
  /** Group heading; omit for a flat single link. */
  title?: string;
  links: NavLink[];
}

function buildGroups(session: Session, lang: Locale, nav: Dictionary["account"]["nav"]): NavGroup[] {
  if (session.role === "agency") {
    return [
      { links: [{ key: "bookings", label: nav.bookings, href: `/${lang}/agenzie/prenotazioni` }] },
      {
        links: [
          { key: "discountCodes", label: nav.discountCodes, href: `/${lang}/agenzie/codici-sconto` },
        ],
      },
      {
        title: nav.administration,
        links: [
          { key: "profile", label: nav.profile, href: `/${lang}/agenzie/profilo` },
          { key: "payment", label: nav.payment, href: `/${lang}/agenzie/profilo/pagamento` },
          { key: "password", label: nav.password, href: `/${lang}/agenzie/profilo/password` },
        ],
      },
    ];
  }
  // customer
  return [
    { links: [{ key: "bookings", label: nav.bookings, href: `/${lang}/area/prenotazioni` }] },
  ];
}

export function AccountNav({
  lang,
  dict,
  session,
  active,
}: {
  lang: Locale;
  dict: Dictionary["account"];
  session: Session;
  active?: AccountNavKey;
}) {
  const groups = buildGroups(session, lang, dict.nav);

  return (
    <nav
      aria-label={dict.nav.area}
      className="rounded-[15px] border border-soft-grey bg-white p-4 sm:p-5"
    >
      <div className="flex flex-col gap-5">
        {groups.map((group, i) => (
          <div key={group.title ?? `group-${i}`} className="flex flex-col gap-1">
            {group.title ? (
              <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-ink/60">
                {group.title}
              </p>
            ) : null}
            {group.links.map((link) => {
              const on = link.key === active;
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  aria-current={on ? "page" : undefined}
                  className={
                    on
                      ? "rounded-[10px] bg-soft px-3 py-2.5 text-sm font-bold text-cta"
                      : "rounded-[10px] px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-soft/60 hover:text-cta"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="border-t border-soft-grey pt-4">
          <LogoutButton lang={lang} label={dict.nav.logout} />
        </div>
      </div>
    </nav>
  );
}
