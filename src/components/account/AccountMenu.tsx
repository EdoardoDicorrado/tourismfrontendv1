"use client";

import Image from "next/image";
import { useState } from "react";

import { AgencyMenu, type AgencyMenuData } from "@/components/account/AgencyMenu";
import { LoginModal } from "@/components/account/LoginModal";
import { UserMenu } from "@/components/account/UserMenu";
import { useDemoUser } from "@/lib/auth/demoUser";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Header avatar entry. A signed-in agency (real httpOnly session, passed in from the
 * server Header) takes precedence: the avatar opens the agency drawer. Otherwise the
 * DEMO customer flag ({@link useDemoUser}) drives it — logged out opens the login
 * popup, signed in opens the account drawer (bookings / support / cancellations).
 * The demo flag previews the customer flow before the real session backend exists.
 */
export function AccountMenu({
  lang,
  dict,
  agency = null,
}: {
  lang: Locale;
  dict: Dictionary;
  /** Present when a real agency session is active (server-read). */
  agency?: AgencyMenuData | null;
}) {
  const user = useDemoUser();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [agencyOpen, setAgencyOpen] = useState(false);

  const label = agency ? dict.account.agencyMenu.title : user ? dict.account.menu.title : dict.header.login;
  const name = agency ? agency.name : user ? user.name : null;

  return (
    <>
      <button
        type="button"
        onClick={() => (agency ? setAgencyOpen(true) : user ? setMenuOpen(true) : setLoginOpen(true))}
        aria-haspopup="dialog"
        aria-label={label}
        className="flex h-11 w-11 items-center justify-center gap-2 text-cta sm:w-auto sm:px-1"
      >
        <Image src="/images/icon-avatar.svg" alt="" width={24} height={24} unoptimized />
        <span className="hidden max-w-[8rem] truncate text-sm font-semibold sm:inline">
          {name ? name.split(/\s+/)[0] : dict.header.login}
        </span>
      </button>

      <LoginModal
        lang={lang}
        dict={dict}
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
      />
      <UserMenu lang={lang} dict={dict} user={user} open={menuOpen} onClose={() => setMenuOpen(false)} />
      {agency ? (
        <AgencyMenu
          lang={lang}
          dict={dict}
          agency={agency}
          open={agencyOpen}
          onClose={() => setAgencyOpen(false)}
        />
      ) : null}
    </>
  );
}
