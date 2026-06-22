"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Flash } from "@/components/account/ui";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Profile-cancellation request card (destructive). Two-step inline confirm to
 * avoid an accidental request.
 *
 * PREVIEW: the confirm only shows a success message — no request is sent. Wiring
 * the real deactivation/cancellation endpoint is a full-stack task.
 */
export function AgencyCancellationCard({ dict }: { dict: Dictionary["account"]["settings"] }) {
  const [confirming, setConfirming] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <Card as="section" variant="white" className="flex flex-col gap-3 border-badge/40">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-badge/10 text-badge">
          <TrashIcon />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-ink">{dict.cancelTitle}</h3>
          <p className="mt-1 text-sm text-ink/60">{dict.cancelDesc}</p>
        </div>
      </div>

      {sent ? (
        <Flash variant="success">{dict.cancelSent}</Flash>
      ) : confirming ? (
        <div className="flex flex-col gap-3 rounded-card bg-soft p-4">
          <p className="text-sm font-semibold text-ink">{dict.cancelConfirm}</p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="destructive" size="sm" onClick={() => setSent(true)}>
              {dict.cancelConfirmYes}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              {dict.cancelConfirmNo}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="destructive"
          size="md"
          className="self-start"
          onClick={() => setConfirming(true)}
        >
          {dict.cancelCta}
        </Button>
      )}
    </Card>
  );
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7m4 4v6m4-6v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
