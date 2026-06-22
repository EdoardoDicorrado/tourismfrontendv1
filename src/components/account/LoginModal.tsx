"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { CustomerLoginForm } from "@/components/account/CustomerLoginForm";
import { useFocusTrap } from "@/components/ui/useFocusTrap";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Centered login popup (GetYourGuide-style). Controlled by the parent ({@link
 * AccountMenu}): `open`/`onClose` drive it. Backdrop, body-scroll lock, Esc to
 * close, focus move-in/restore AND the Tab trap come from the shared
 * {@link useFocusTrap}. Sign-in state is set by the form itself (`signInDemo` in
 * `finish()`), so the modal only closes when the flow completes.
 */
export function LoginModal({
  lang,
  dict,
  open,
  onClose,
}: {
  lang: Locale;
  dict: Dictionary;
  open: boolean;
  onClose: () => void;
}) {
  const t = dict.account.customerLogin;
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useFocusTrap(open, panelRef, onClose);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label={t.close}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.3 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.title}
            tabIndex={-1}
            className="relative w-full max-w-[420px] rounded-panel bg-white p-6 shadow-popover sm:p-8"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: [0, 0, 0.2, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-soft hover:text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
            <CustomerLoginForm lang={lang} dict={t} onDone={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
