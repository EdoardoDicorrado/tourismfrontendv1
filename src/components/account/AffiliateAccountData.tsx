"use client";

import { CustomerProfileForm } from "@/components/account/CustomerProfileForm";
import { useDemoUser } from "@/lib/auth/demoUser";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Affiliate account data (`/[lang]/affiliati/profilo`). Reuses the generic
 * {@link CustomerProfileForm} (name / email / phone, client-only mock save) but
 * prefilled from the affiliate's DEMO flag (`useDemoUser`), since there's no
 * affiliate session on the server yet (#37).
 *
 * The `key` remounts the form once the demo user resolves on the client (SSR
 * snapshot is null), so the prefilled values actually populate the inputs.
 */
export function AffiliateAccountData({
  dict,
  feedback,
}: {
  dict: Dictionary["account"]["customerSettings"];
  feedback: Dictionary["account"]["feedback"];
}) {
  const user = useDemoUser();
  const [firstName = "", ...rest] = (user?.name ?? "").trim().split(/\s+/);
  const initial = {
    firstName,
    lastName: rest.join(" "),
    email: user?.email ?? "",
    phone: "",
  };

  return (
    <CustomerProfileForm
      key={user?.email ?? "anon"}
      dict={dict}
      feedback={feedback}
      initial={initial}
    />
  );
}
