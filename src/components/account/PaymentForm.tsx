"use client";

import { useState } from "react";

import { Flash, SubmitButton, fieldInputClass } from "@/components/account/ui";
import { formatMoney } from "@/lib/format";
import type { GuaranteeAmount, PaymentInfo } from "@/lib/account/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Agency billing + payout details editor (`/[lang]/agenzie/profilo/pagamento`).
 *
 * Four sections: fiscal data (VAT/tax + identity document), PayPal, bank-transfer
 * coordinates, and the READ-ONLY guarantees + deposit (admin-managed).
 *
 * Sensitive values (IBAN, account number, identity document number, PayPal email)
 * come back MASKED on read — those inputs start empty and show the masked value as
 * a placeholder. Per the backend contract an empty string means "leave unchanged",
 * so submitting without retyping is a no-op; the BFF/backend never clears a stored
 * secret on a blank. Non-sensitive fields are prefilled normally.
 *
 * React Compiler is ON: local `useState` only, mutated in the onSubmit handler.
 */

type Status = "idle" | "saving" | "saved" | "error";

const labelClass = "mb-1 block text-sm font-bold text-ink";

interface FormState {
  // fiscal / billing
  vat_id: string;
  tax_code: string;
  identity_document_type: string;
  identity_document_number: string; // masked → starts blank
  identity_document_country_alpha2: string;
  // paypal
  paypal_email: string; // masked → starts blank
  paypal_country_alpha2: string;
  // bank_transfer
  beneficiary: string;
  iban: string; // masked → starts blank
  account_number: string; // masked → starts blank
  bank_name: string;
  swift: string;
  aba: string;
  bank_address: string;
  bank_city: string;
  bank_country: string;
  intermediary: string;
}

/** Editable overlay: non-sensitive fields prefilled; masked secrets start blank. */
function toFormState(info: PaymentInfo): FormState {
  return {
    vat_id: info.vat_id ?? "",
    tax_code: info.tax_code ?? "",
    identity_document_type: info.identity_document_type ?? "",
    identity_document_number: "",
    identity_document_country_alpha2: info.identity_document_country_alpha2 ?? "",
    paypal_email: "",
    paypal_country_alpha2: info.paypal_country_alpha2 ?? "",
    beneficiary: info.bank_transfer.beneficiary ?? "",
    iban: "",
    account_number: "",
    bank_name: info.bank_transfer.bank_name ?? "",
    swift: info.bank_transfer.swift ?? "",
    aba: info.bank_transfer.aba ?? "",
    bank_address: info.bank_transfer.address ?? "",
    bank_city: info.bank_transfer.city ?? "",
    bank_country: info.bank_transfer.country_alpha2 ?? "",
    intermediary: info.bank_transfer.intermediary ?? "",
  };
}

/** "€120,00 (≥ 30%)" for a guarantee; thresholds may be absent. */
function guaranteeText(g: GuaranteeAmount, lang: Locale): string {
  const amount = formatMoney(g.amount_cents / 100, lang);
  return g.threshold_percent == null ? amount : `${amount} (${g.threshold_percent}%)`;
}

export function PaymentForm({
  lang,
  dict,
  feedback,
  payment,
}: {
  lang: Locale;
  dict: Dictionary["account"]["payment"];
  feedback: Dictionary["account"]["feedback"];
  payment: PaymentInfo;
}) {
  // Keep the server view in state so masked placeholders + read-only values
  // refresh after a successful save.
  const [info, setInfo] = useState<PaymentInfo>(payment);
  const [form, setForm] = useState<FormState>(() => toFormState(payment));
  const [status, setStatus] = useState<Status>("idle");

  const set =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "saving") return;
    setStatus("saving");
    try {
      const res = await fetch("/api/agency/payment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vat_id: form.vat_id,
          tax_code: form.tax_code,
          identity_document_type: form.identity_document_type,
          identity_document_number: form.identity_document_number,
          identity_document_country_alpha2: form.identity_document_country_alpha2,
          paypal_email: form.paypal_email,
          paypal_country_alpha2: form.paypal_country_alpha2,
          bank_transfer: {
            beneficiary: form.beneficiary,
            iban: form.iban,
            account_number: form.account_number,
            bank_name: form.bank_name,
            swift: form.swift,
            aba: form.aba,
            address: form.bank_address,
            city: form.bank_city,
            country_alpha2: form.bank_country,
            intermediary: form.intermediary,
          },
        }),
      });
      const data = (await res.json()) as { ok?: boolean; payment?: PaymentInfo };
      if (!res.ok || !data.ok || !data.payment) throw new Error("failed");
      setInfo(data.payment);
      setForm(toFormState(data.payment));
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <p className="text-sm text-ink/60">{dict.maskedHint}</p>

      {/* Fiscal data */}
      <fieldset className="rounded-[15px] border border-soft-grey bg-white p-6 sm:p-8">
        <legend className="px-2 text-lg font-extrabold text-ink">{dict.billingTitle}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="vat_id" label={dict.vatId} value={form.vat_id} onChange={set("vat_id")} />
          <TextField id="tax_code" label={dict.taxCode} value={form.tax_code} onChange={set("tax_code")} />
          <TextField id="identity_document_type" label={dict.identityDocumentType} value={form.identity_document_type} onChange={set("identity_document_type")} />
          <TextField id="identity_document_number" label={dict.identityDocumentNumber} value={form.identity_document_number} onChange={set("identity_document_number")} placeholder={info.identity_document_number ?? undefined} />
          <TextField id="identity_document_country_alpha2" label={dict.identityDocumentCountry} value={form.identity_document_country_alpha2} onChange={set("identity_document_country_alpha2")} maxLength={2} autoComplete="country" />
        </div>
      </fieldset>

      {/* PayPal */}
      <fieldset className="rounded-[15px] border border-soft-grey bg-white p-6 sm:p-8">
        <legend className="px-2 text-lg font-extrabold text-ink">{dict.paypalTitle}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="paypal_email" type="email" label={dict.paypalEmail} value={form.paypal_email} onChange={set("paypal_email")} placeholder={info.paypal_email ?? undefined} autoComplete="email" />
          <TextField id="paypal_country_alpha2" label={dict.paypalCountry} value={form.paypal_country_alpha2} onChange={set("paypal_country_alpha2")} maxLength={2} autoComplete="country" />
        </div>
      </fieldset>

      {/* Bank transfer */}
      <fieldset className="rounded-[15px] border border-soft-grey bg-white p-6 sm:p-8">
        <legend className="px-2 text-lg font-extrabold text-ink">{dict.bankTitle}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="beneficiary" label={dict.beneficiary} value={form.beneficiary} onChange={set("beneficiary")} />
          <TextField id="iban" label={dict.iban} value={form.iban} onChange={set("iban")} placeholder={info.bank_transfer.iban ?? undefined} />
          <TextField id="account_number" label={dict.accountNumber} value={form.account_number} onChange={set("account_number")} placeholder={info.bank_transfer.account_number ?? undefined} />
          <TextField id="bank_name" label={dict.bankName} value={form.bank_name} onChange={set("bank_name")} />
          <TextField id="swift" label={dict.swift} value={form.swift} onChange={set("swift")} />
          <TextField id="aba" label={dict.aba} value={form.aba} onChange={set("aba")} />
          <div className="sm:col-span-2">
            <TextField id="bank_address" label={dict.bankAddress} value={form.bank_address} onChange={set("bank_address")} />
          </div>
          <TextField id="bank_city" label={dict.bankCity} value={form.bank_city} onChange={set("bank_city")} />
          <TextField id="bank_country" label={dict.bankCountry} value={form.bank_country} onChange={set("bank_country")} maxLength={2} autoComplete="country" />
          <div className="sm:col-span-2">
            <TextField id="intermediary" label={dict.intermediaryBank} value={form.intermediary} onChange={set("intermediary")} />
          </div>
        </div>
      </fieldset>

      {/* Guarantees + deposit (read-only, admin-managed) */}
      <fieldset className="rounded-[15px] border border-soft-grey bg-white p-6 sm:p-8">
        <legend className="px-2 text-lg font-extrabold text-ink">{dict.guaranteesTitle}</legend>
        <dl className="grid gap-4 sm:grid-cols-2">
          <ReadOnly label={dict.bankTransferGuarantee} value={guaranteeText(info.guarantees.bank_transfer_guarantee, lang)} />
          <ReadOnly label={dict.checkGuarantee} value={guaranteeText(info.guarantees.check_guarantee, lang)} />
          <ReadOnly label={dict.depositAmount} value={formatMoney(info.deposit.amount_cents / 100, lang)} />
          <ReadOnly label={dict.depositPaid} value={info.deposit.paid ? "✓" : "—"} />
        </dl>
        <p className="mt-2 text-xs text-ink/60">{dict.readonlyNote}</p>
      </fieldset>

      {status === "saved" ? <Flash variant="success">{feedback.saved}</Flash> : null}
      {status === "error" ? <Flash variant="error">{feedback.error}</Flash> : null}

      <div className="sm:max-w-[260px]">
        <SubmitButton loading={status === "saving"} loadingLabel={feedback.loading}>
          {dict.save}
        </SubmitButton>
      </div>
    </form>
  );
}

/** Controlled text input matching the design-system field. */
function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className={fieldInputClass}
      />
    </div>
  );
}

/** A read-only labelled value (admin-managed guarantees/deposit). */
function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={labelClass}>{label}</dt>
      <dd className="text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
