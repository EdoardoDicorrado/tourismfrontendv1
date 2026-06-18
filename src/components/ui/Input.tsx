import type { InputHTMLAttributes, ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Input / Field — the single source of truth for text inputs across the
 * storefront. Previously the input look was duplicated (`fieldInputClass` in
 * account/ui, `inputClass` in auth/LoginForm, plus dozens of inline copies in
 * the forms). Everyone should consume `inputClass` (bare/controlled inputs) or
 * `<Field>` (label + input + inline error).
 *
 * Server component by default (no hooks). For a controlled input inside a client
 * form, render `<input className={inputClass}>` or `<Input>` yourself.
 *
 * Look: `border-stroke` + `focus:border-cta`, `rounded-card`, disabled → soft
 * bg. Errors reuse the `badge` token (no new colors).
 */

/** Canonical input className. Append `border-badge` for the error state. */
export const inputClass =
  "w-full rounded-card border border-stroke bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-cta disabled:cursor-not-allowed disabled:bg-soft disabled:text-ink/70";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Inline error state — switches the border to the badge token. */
  invalid?: boolean;
}

/** Bare styled input (no label). Use inside a labelled wrapper or `<Field>`. */
export function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cx(inputClass, invalid && "border-badge", className)}
      {...props}
    />
  );
}

export interface FieldProps {
  id: string;
  name: string;
  label: ReactNode;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  /** Inline validation message (shown in `text-badge`). */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  /** Optional right-aligned label adornment, e.g. a "forgot password?" link. */
  labelAddon?: ReactNode;
  /** Extra class on the input. */
  inputClassName?: string;
}

/**
 * Labelled input: label (+ optional addon) + input (+ optional inline error).
 * Renders an uncontrolled input via `defaultValue` (FormData/DOM-read pattern).
 */
export function Field({
  id,
  name,
  label,
  type = "text",
  defaultValue,
  placeholder,
  error,
  required,
  disabled,
  autoComplete,
  labelAddon,
  inputClassName,
}: FieldProps) {
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div>
      {labelAddon ? (
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <label htmlFor={id} className="block text-sm font-bold text-ink">
            {label}
          </label>
          {labelAddon}
        </div>
      ) : (
        <label htmlFor={id} className="mb-1 block text-sm font-bold text-ink">
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(inputClass, error && "border-badge", inputClassName)}
      />
      {error ? (
        <p id={describedBy} className="mt-1 text-sm font-semibold text-badge">
          {error}
        </p>
      ) : null}
    </div>
  );
}
