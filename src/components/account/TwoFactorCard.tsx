"use client";

import { useState } from "react";

import { Flash, fieldInputClass } from "@/components/account/ui";
import { buttonVariants } from "@/components/ui/buttonVariants";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Agency two-factor authentication (`/[lang]/agenzie/profilo/sicurezza`).
 *
 * PREVIEW (full-stack): no real TOTP backend yet — enable/disable is local state
 * (resets on reload) over a mock secret. The 6-digit confirm just checks length so
 * the enable flow can be shown end-to-end. Wire to a real `/agency/2fa` endpoint
 * (enroll → secret/QR, verify, disable) when it lands.
 *
 * React Compiler is ON: local `useState` only, mutated in event handlers.
 */

// ponytail: static demo secret — a real enroll call returns a per-user secret + QR.
const DEMO_SECRET = "JBSW Y3DP EHPK 3PXP";

type Status = "idle" | "setup" | "error";

export function TwoFactorCard({ dict }: { dict: Dictionary["account"]["twoFactor"] }) {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [code, setCode] = useState("");
  const [flash, setFlash] = useState<"enabled" | "disabled" | null>(null);

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    // PREVIEW: any 6-digit code is accepted as valid.
    if (!/^\d{6}$/.test(code.trim())) {
      setStatus("error");
      return;
    }
    setEnabled(true);
    setStatus("idle");
    setCode("");
    setFlash("enabled");
  }

  function disable() {
    setEnabled(false);
    setStatus("idle");
    setCode("");
    setFlash("disabled");
  }

  return (
    <section className="flex max-w-lg flex-col gap-4 rounded-panel border border-soft-grey bg-white p-6 sm:p-8">
      <div>
        <h3 className="text-lg font-extrabold text-ink">{dict.title}</h3>
        <p className="mt-1 text-sm text-ink/60">{dict.desc}</p>
      </div>

      <p className="flex items-center gap-2 text-sm font-bold">
        <span
          className={`inline-block size-2.5 rounded-full ${enabled ? "bg-cta" : "bg-ink/30"}`}
          aria-hidden
        />
        <span className={enabled ? "text-cta" : "text-ink/60"}>
          {enabled ? dict.statusOn : dict.statusOff}
        </span>
      </p>

      {flash === "enabled" && status === "idle" && <Flash variant="success">{dict.enabled}</Flash>}
      {flash === "disabled" && <Flash variant="success">{dict.disabled}</Flash>}

      {enabled ? (
        <button
          type="button"
          onClick={disable}
          className={buttonVariants({ variant: "destructive", size: "md" }) + " self-start"}
        >
          {dict.disable}
        </button>
      ) : status === "setup" || status === "error" ? (
        <form onSubmit={confirm} className="flex flex-col gap-4 border-t border-soft-grey pt-4">
          <p className="text-sm font-bold text-ink">{dict.setupTitle}</p>
          <p className="text-sm text-ink/70">{dict.setupBody}</p>
          <div>
            <span className="mb-1 block text-sm font-bold text-ink">{dict.secretLabel}</span>
            <code className="block rounded-card border border-soft-grey bg-soft/40 px-4 py-3 font-mono text-base tracking-widest text-ink">
              {DEMO_SECRET}
            </code>
          </div>
          <div>
            <label htmlFor="totp" className="mb-1 block text-sm font-bold text-ink">
              {dict.codeLabel}
            </label>
            <input
              id="totp"
              name="totp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setStatus("setup");
              }}
              className={fieldInputClass}
            />
          </div>
          {status === "error" && <Flash variant="error">{dict.invalid}</Flash>}
          <div className="flex items-center gap-3">
            <button type="submit" className={buttonVariants({ variant: "primary", size: "md" })}>
              {dict.confirm}
            </button>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setCode("");
              }}
              className={buttonVariants({ variant: "outline", size: "md" })}
            >
              {dict.cancel}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setStatus("setup");
            setFlash(null);
          }}
          className={buttonVariants({ variant: "primary", size: "md" }) + " self-start"}
        >
          {dict.enable}
        </button>
      )}
    </section>
  );
}
