"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Toast, ToastViewport, type ToastVariant } from "@/components/ui/Toast";
import { duration, ease } from "@/lib/motion/tokens";

/**
 * Toast system — queue + auto-dismiss + enter/exit motion.
 *
 * Split of ownership: the `Toast`/`ToastViewport` PRESENTATION is `design-system`'s
 * primitive; this provider adds the MOTION + orchestration (`animations`). Mount
 * `<ToastProvider>` once near the root (inside `MotionProvider`, see layout), then
 * fire toasts from any client component via `useToast()`:
 *
 *   const { toast } = useToast();
 *   toast({ variant: "success", title: "Aggiunto al carrello" });
 *
 * Reduced motion is handled centrally by `<MotionProvider reducedMotion="user">`:
 * transform/scale are dropped, opacity is kept, so toasts still fade in/out.
 */

export interface ToastOptions {
  variant?: ToastVariant;
  title?: ReactNode;
  message?: ReactNode;
  /** Auto-dismiss after N ms. `0`/`Infinity` keeps it until manually closed. Default 5000. */
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

interface ToastValue {
  /** Enqueue a toast. Returns its id (to `dismiss()` early if needed). */
  toast: (options: ToastOptions) => number;
  /** Remove a toast immediately (plays the exit animation). */
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

/** Cap the visible stack so a burst can't cover the screen — drop the oldest. */
const MAX_VISIBLE = 4;
const DEFAULT_DURATION = 5000;

// Client-only, monotonic id — avoids Date.now()/random and any hydration surprise.
let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // Auto-dismiss timers, keyed by toast id, so we can clear them on early dismiss/unmount.
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  function clearTimer(id: number) {
    const handle = timers.current.get(id);
    if (handle !== undefined) {
      clearTimeout(handle);
      timers.current.delete(id);
    }
  }

  function dismiss(id: number) {
    clearTimer(id);
    setToasts((current) => current.filter((t) => t.id !== id));
  }

  function toast(options: ToastOptions): number {
    const id = nextId++;
    const item: ToastItem = { id, ...options };

    setToasts((current) => {
      const next = [...current, item];
      // Trim the oldest beyond the cap (and clear their pending timers).
      while (next.length > MAX_VISIBLE) {
        const dropped = next.shift();
        if (dropped) clearTimer(dropped.id);
      }
      return next;
    });

    const ms = options.duration ?? DEFAULT_DURATION;
    if (ms !== 0 && ms !== Infinity) {
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), ms),
      );
    }
    return id;
  }

  // Clear every pending timer if the provider unmounts.
  useEffect(() => {
    const map = timers.current;
    return () => {
      for (const handle of map.values()) clearTimeout(handle);
      map.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastViewport>
        {/* `initial={false}` → no entrance animation on first paint for an already-empty
            stack; new toasts still animate in. `popLayout` lets the remaining toasts
            slide up smoothly when one above them leaves. */}
        <AnimatePresence initial={false} mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              className="pointer-events-none w-full max-w-sm"
              // Viewport ancorato in alto (top-0) → il toast entra DALL'ALTO (y:-16),
              // coerente con la direzione da cui compare.
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: duration.fast, ease: ease.entrance } }}
              transition={{ duration: duration.base, ease: ease.entrance }}
            >
              <Toast
                variant={t.variant}
                title={t.title}
                onClose={() => dismiss(t.id)}
              >
                {t.message}
              </Toast>
            </motion.div>
          ))}
        </AnimatePresence>
      </ToastViewport>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
