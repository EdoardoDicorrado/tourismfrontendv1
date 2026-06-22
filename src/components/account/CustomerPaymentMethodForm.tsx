"use client";

import { useState } from "react";

import { Flash, SubmitButton, fieldInputClass } from "@/components/account/ui";
import { buttonVariants } from "@/components/ui/buttonVariants";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Customer saved-payment-methods (`/[lang]/area/profilo/pagamento`).
 *
 * PREVIEW: client-only mock. There is no saved-cards backend — real saved methods
 * are tokenized by the PSP (Redsys), the raw PAN must NEVER reach our servers
 * (PCI). Saved cards live in local state (start empty → "nessun metodo" + CTA);
 * adding/editing keeps the fields client-side and flashes success without sending
 * anything. Real wiring (PSP tokenization + a `/account/payment-methods` seam) is a
 * full-stack task.
 *
 * ponytail: in-memory list, no persistence; swap for a PSP hosted-field +
 * tokenization flow when payments are wired.
 */

const labelClass = "mb-1 block text-sm font-bold text-ink";

interface SavedCard {
  id: string;
  holder: string;
  number: string;
  exp: string;
}

/** Last 4 digits of a (possibly spaced) PAN, for the masked card label. */
function last4(number: string): string {
  return number.replace(/\D/g, "").slice(-4) || "••••";
}

export function CustomerPaymentMethodForm({
  dict,
  feedback,
}: {
  dict: Dictionary["account"]["customerSettings"];
  feedback: Dictionary["account"]["feedback"];
}) {
  const [methods, setMethods] = useState<SavedCard[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [saved, setSaved] = useState(false);

  function openAdd() {
    setEditingId(null);
    setHolder("");
    setNumber("");
    setExp("");
    setCvc("");
    setSaved(false);
    setFormOpen(true);
  }

  function openEdit(card: SavedCard) {
    setEditingId(card.id);
    setHolder(card.holder);
    setNumber(card.number);
    setExp(card.exp);
    setCvc("");
    setSaved(false);
    setFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // PREVIEW: card data is never sent anywhere — just upsert into the local list.
    const card: SavedCard = { id: editingId ?? crypto.randomUUID(), holder, number, exp };
    setMethods((list) =>
      editingId ? list.map((m) => (m.id === editingId ? card : m)) : [...list, card],
    );
    setFormOpen(false);
    setEditingId(null);
    setSaved(true);
  }

  // Add / edit form.
  if (formOpen) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex max-w-lg flex-col gap-4 rounded-panel border border-soft-grey bg-white p-6 sm:p-8"
      >
        <div>
          <label htmlFor="cardholder" className={labelClass}>
            {dict.cardholder}
          </label>
          <input
            id="cardholder"
            name="cardholder"
            type="text"
            autoComplete="cc-name"
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
            className={fieldInputClass}
          />
        </div>
        <div>
          <label htmlFor="card_number" className={labelClass}>
            {dict.cardNumber}
          </label>
          <input
            id="card_number"
            name="card_number"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="•••• •••• •••• ••••"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className={fieldInputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="card_expiry" className={labelClass}>
              {dict.expiry}
            </label>
            <input
              id="card_expiry"
              name="card_expiry"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/AA"
              value={exp}
              onChange={(e) => setExp(e.target.value)}
              className={fieldInputClass}
            />
          </div>
          <div>
            <label htmlFor="card_cvc" className={labelClass}>
              {dict.cvc}
            </label>
            <input
              id="card_cvc"
              name="card_cvc"
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="•••"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              className={fieldInputClass}
            />
          </div>
        </div>

        <p className="text-sm text-ink/60">{dict.paymentNote}</p>

        <div className="mt-2 flex items-center gap-3">
          <SubmitButton>{dict.addCard}</SubmitButton>
          <button
            type="button"
            onClick={() => {
              setFormOpen(false);
              setEditingId(null);
            }}
            className={buttonVariants({ variant: "outline", size: "md" })}
          >
            {dict.cancel}
          </button>
        </div>
      </form>
    );
  }

  // Empty state: no saved methods → message + "Aggiungi metodo di pagamento".
  if (methods.length === 0) {
    return (
      <div className="flex max-w-lg flex-col gap-4">
        {saved ? <Flash variant="success">{feedback.saved}</Flash> : null}
        <div className="rounded-panel border border-dashed border-soft-grey bg-white p-6 text-center text-ink/60 sm:p-8">
          {dict.noMethods}
        </div>
        <button
          type="button"
          onClick={openAdd}
          className={buttonVariants({ variant: "primary", size: "md" }) + " self-start"}
        >
          {dict.addMethod}
        </button>
      </div>
    );
  }

  // Saved methods: filled cards + "Modifica", with an "Aggiungi" CTA below.
  return (
    <div className="flex max-w-lg flex-col gap-4">
      {saved ? <Flash variant="success">{feedback.saved}</Flash> : null}
      {methods.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between gap-3 rounded-panel border border-soft-grey bg-white p-6 sm:p-8"
        >
          <div className="min-w-0">
            <p className="font-bold text-ink">•••• •••• •••• {last4(m.number)}</p>
            <p className="text-sm text-ink/60">
              {[m.holder, m.exp].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openEdit(m)}
            className="shrink-0 text-sm font-bold text-cta hover:underline"
          >
            {dict.edit}
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={openAdd}
        className={buttonVariants({ variant: "primary", size: "md" }) + " self-start"}
      >
        {dict.addMethod}
      </button>
    </div>
  );
}
