"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { useFocusTrap } from "@/components/ui/useFocusTrap";
import { signOutDemo, type DemoUser } from "@/lib/auth/demoUser";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Slide-in account drawer (right edge), same conventions as the CartDrawer: backdrop,
 * body-scroll lock, Esc to close, focus management, stays mounted so the transform
 * animates both ways. Shows the user's main info + the account links (bookings,
 * support, cancellations) and a sign-out action.
 */
export function UserMenu({
  open,
  onClose,
  user,
  lang,
  dict,
}: {
  open: boolean;
  onClose: () => void;
  user: DemoUser | null;
  lang: Locale;
  dict: Dictionary;
}) {
  const m = dict.account.menu;
  const asideRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useFocusTrap(open, asideRef, onClose);

  const items = [
    { href: `/${lang}/area/prenotazioni`, label: m.bookings, icon: <TicketIcon /> },
    { href: `/${lang}/supporto`, label: m.support, icon: <SupportIcon /> },
    // Cancellations live in the bookings list under the "cancelled" tab — no
    // separate page needed (avoids a dead /area/cancellazioni route).
    { href: `/${lang}/area/prenotazioni?tab=cancelled`, label: m.cancellations, icon: <CancelIcon /> },
  ];

  const initials = user
    ? user.name
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

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
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label={m.title}
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-[90%] max-w-[400px] flex-col bg-white shadow-2xl"
        initial={false}
        animate={{ x: open ? "0%" : "100%" }}
        transition={reduce ? { duration: 0 } : { duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      >
        <header className="flex items-start justify-between gap-3 border-b border-soft-grey px-5 py-4">
          {user && (
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-cta/10 text-sm font-extrabold text-cta">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate font-extrabold text-ink">{user.name}</p>
                <p className="truncate text-sm text-ink/60">{user.email}</p>
              </div>
            </div>
          )}
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

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-card px-3 py-3 text-ink transition-colors hover:bg-soft"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-soft text-cta">
                {it.icon}
              </span>
              <span className="flex-1 font-bold">{it.label}</span>
              <svg width="8" height="14" viewBox="0 0 9 14" fill="none" aria-hidden className="text-ink/40">
                <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </nav>

        <footer className="border-t border-soft-grey p-3">
          <button
            type="button"
            onClick={() => {
              signOutDemo();
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-card px-3 py-3 font-bold text-badge transition-colors hover:bg-soft"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-badge/10">
              <LogoutIcon />
            </span>
            {m.logout}
          </button>
        </footer>
      </motion.aside>
    </div>
  );
}

function TicketIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M14 6v12" stroke="currentColor" strokeWidth="1.8" strokeDasharray="2 2" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 12a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-1v-6h3M4 12v5a2 2 0 0 0 2 2h1v-6H4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-badge">
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
