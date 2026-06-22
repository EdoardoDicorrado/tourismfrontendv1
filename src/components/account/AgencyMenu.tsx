"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { Badge } from "@/components/ui/Badge";
import { fill } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export interface AgencyMenuData {
  name: string;
  vatId: string | null;
}

/**
 * Agency avatar drawer — the agency counterpart to {@link UserMenu}. Same
 * slide-in/backdrop/Esc/scroll-lock conventions. Header shows the agency icon
 * (left) with the name + VAT right-aligned on the same row; below it the menu
 * entries (bookings / discounts / support) separated by dividers, and a footer
 * with account settings + logout. Logout clears the httpOnly session via the BFF
 * then sends the agency back to its login.
 */
export function AgencyMenu({
  open,
  onClose,
  agency,
  lang,
  dict,
}: {
  open: boolean;
  onClose: () => void;
  agency: AgencyMenuData;
  lang: Locale;
  dict: Dictionary;
}) {
  const m = dict.account.agencyMenu;
  const router = useRouter();
  const panelRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prevFocused = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      if (prevFocused instanceof HTMLElement) prevFocused.focus();
    };
  }, [open, onClose]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Best-effort — send the agency back to login regardless.
    }
    onClose();
    router.push(`/${lang}/agenzie/accedi`);
    router.refresh();
  }

  // Voce "Sconti" rimossa dal menu agenzia (richiesta orchestratore #61); la rotta
  // /agenzie/codici-sconto resta. "Assistenza" → pagina dedicata agenzie.
  const items = [
    // "Dashboard agenzia" first (IT label hardcoded — preview, like the affiliate
    // surface; i18n deposited to marketing).
    { href: `/${lang}/agenzie/dashboard`, label: "Dashboard agenzia" },
    { href: `/${lang}/agenzie/prenotazioni`, label: m.bookings },
    { href: `/${lang}/agenzie/assistenza`, label: m.support },
  ];

  return (
    <div className={`fixed inset-0 z-[var(--z-overlay)] ${open ? "" : "pointer-events-none"}`} inert={!open}>
      <motion.button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label={m.close}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.3 }}
      />

      <motion.aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={m.title}
        className="absolute right-0 top-0 flex h-full w-[90%] max-w-[400px] flex-col bg-white shadow-2xl outline-none"
        initial={false}
        animate={{ x: open ? "0%" : "100%" }}
        transition={reduce ? { duration: 0 } : { duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      >
        <header className="flex items-start gap-3 border-b border-soft-grey px-5 py-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-cta/10 text-cta">
            <AgencyIcon />
          </span>
          <div className="flex min-w-0 flex-1 flex-col items-end gap-1 text-right">
            <p className="w-full truncate font-extrabold text-ink">{agency.name}</p>
            {agency.vatId ? (
              <p className="w-full truncate text-xs text-ink/60">{fill(m.vat, { vat: agency.vatId })}</p>
            ) : null}
            <Badge variant="solid" tone="cta" size="sm">
              {m.discountBadge}
            </Badge>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={m.close}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-soft"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <nav className="flex flex-1 flex-col overflow-y-auto">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={onClose}
              className="flex items-center justify-between gap-3 border-b border-soft-grey px-5 py-4 font-bold text-ink transition-colors hover:bg-soft"
            >
              <span>{it.label}</span>
              <Chevron />
            </Link>
          ))}
        </nav>

        <footer className="flex flex-col">
          <Link
            href={`/${lang}/agenzie/impostazioni`}
            onClick={onClose}
            className="flex items-center gap-3 border-t border-soft-grey px-5 py-4 font-bold text-ink transition-colors hover:bg-soft"
          >
            <GearIcon />
            <span className="flex-1">{m.accountSettings}</span>
            <Chevron />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 border-t border-soft-grey px-5 py-4 text-left font-bold text-badge transition-colors hover:bg-soft disabled:opacity-60"
          >
            <LogoutIcon />
            {m.logout}
          </button>
        </footer>
      </motion.aside>
    </div>
  );
}

function AgencyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 21h18M5 21V8l7-4 7 4v13" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 21v-5h6v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 11h1m3 0h1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="8" height="14" viewBox="0 0 9 14" fill="none" aria-hidden className="text-ink/40">
      <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-ink/70">
      <path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-badge">
      <path
        d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 12H3m0 0l3.5-3.5M3 12l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
