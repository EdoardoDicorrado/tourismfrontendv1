"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { signOutDemo, useDemoUser } from "@/lib/auth/demoUser";
import type { Locale } from "@/lib/i18n/config";

type Role = "customer" | "agency" | "affiliate";

const ROLE_LABEL: Record<Role, string> = {
  customer: "utente",
  agency: "agenzia",
  affiliate: "affiliato",
};

/**
 * Login conflict guard (PREVIEW). If the visitor is already signed in under a
 * DIFFERENT role than this login page targets, an overlay warns that proceeding
 * will log them out ("Sei già connesso come X… per procedere ti disconnetteremo")
 * with Continua / Annulla.
 *
 * Current identity = the server cookie session (agency/customer, passed in from
 * the page) or, in preview, the demo flag (customer/affiliate via signInDemo).
 * "Continua" clears both and lets the form through; "Annulla" leaves the site
 * as-is (back to home).
 *
 * ponytail: IT strings hardcoded (preview); i18n deposited to marketing.
 */
export function LoginConflictGuard({
  target,
  lang,
  serverIdentity = null,
}: {
  target: Role;
  lang: Locale;
  /** Active cookie session read on the server (agency/customer), if any. */
  serverIdentity?: { role: Role; name: string } | null;
}) {
  const router = useRouter();
  const demo = useDemoUser();
  const [dismissed, setDismissed] = useState(false);
  const [working, setWorking] = useState(false);

  const current: { role: Role; name: string } | null =
    serverIdentity ?? (demo ? { role: demo.role ?? "customer", name: demo.name } : null);
  const conflict = !dismissed && current != null && current.role !== target;

  async function proceed() {
    if (working) return;
    setWorking(true);
    signOutDemo();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // best-effort — preview customer/affiliate have no cookie session to clear
    }
    setDismissed(true);
    router.refresh();
  }

  if (!conflict || !current) return null;

  return (
    <Modal
      open
      onClose={() => router.push(`/${lang}`)}
      label="Sei già connesso"
      className="max-w-[min(28rem,calc(100vw-2rem))]! p-6"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-extrabold text-ink">Sei già connesso</h2>
          <p className="text-sm text-ink/70">
            Sei già connesso come <span className="font-bold text-ink">{current.name}</span> (
            {ROLE_LABEL[current.role]}). Per procedere ti disconnetteremo.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button variant="primary" size="md" onClick={proceed} disabled={working} fullWidth>
            Continua
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => router.push(`/${lang}`)}
            disabled={working}
            fullWidth
          >
            Annulla
          </Button>
        </div>
      </div>
    </Modal>
  );
}
