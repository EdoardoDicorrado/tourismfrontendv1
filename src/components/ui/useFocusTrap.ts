"use client";

import { useEffect, type RefObject } from "react";

/**
 * Modal a11y in ONE hook — the single source for dialog/drawer/sheet focus
 * behaviour. While `active`, it:
 *   1. locks background scroll (`document.body.overflow`),
 *   2. closes on Escape (calls `onClose`),
 *   3. moves focus into `ref` on open and restores it to the previously-focused
 *      element on close,
 *   4. traps Tab inside `ref` (WCAG 2.4.3 / 4.1.2).
 *
 * Extracted from Popover's sheet logic so every overlay gets the SAME behaviour
 * instead of re-implementing it and forgetting the trap (the bug across
 * SearchOverlay/CartDrawer/LoginModal/ProductGallery/UserMenu). Pass the panel
 * ref and a stable `onClose`; render the panel with `tabIndex={-1}`.
 */
const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function useFocusTrap(
  active: boolean,
  ref: RefObject<HTMLElement | null>,
  onClose?: () => void,
) {
  // 1. Background scroll lock.
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  // 2. Focus move-in + restore.
  useEffect(() => {
    if (!active) return;
    const prevFocused = document.activeElement;
    ref.current?.focus();
    return () => {
      if (prevFocused instanceof HTMLElement) prevFocused.focus();
    };
  }, [active, ref]);

  // 3. Escape-to-close + Tab trap (document-level so it works wherever focus is).
  useEffect(() => {
    if (!active) return;
    function onKey(e: KeyboardEvent) {
      const panel = ref.current;
      if (!panel) return;
      if (e.key === "Escape") {
        onClose?.();
        return;
      }
      if (e.key !== "Tab") return;
      const f = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (f.length === 0) {
        e.preventDefault();
        return;
      }
      const first = f[0];
      const last = f[f.length - 1];
      const at = document.activeElement;
      if (e.shiftKey && (at === first || at === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && at === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, ref, onClose]);
}
