"use client";

import { useState } from "react";

/** Copy-to-clipboard button (affiliate referral link). Reverts the label after a beat. */
export function CopyButton({
  text,
  label,
  copiedLabel,
}: {
  text: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable / blocked — no-op */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-card bg-cta px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
