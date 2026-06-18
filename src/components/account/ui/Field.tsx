import type { ReactNode } from "react";

/**
 * Labelled input for account forms — label + input (+ optional inline error).
 *
 * Server component by default (no hooks). It renders an uncontrolled input via
 * `defaultValue`, which is the pattern for forms whose submit handler reads the
 * values from the FormData / DOM (or wraps it in a client form). If you need a
 * controlled input, render a bare `<input className={fieldInputClass}>` yourself
 * inside a client component instead.
 *
 * Mirrors the design-system field from LoginForm: label `text-sm font-bold
 * text-ink`, input with `border-stroke` + `focus:border-cta`. Errors reuse the
 * `text-badge` token (no new colors).
 */

/** Reusable input className (exported so client forms can match the look). */
export const fieldInputClass =
  "w-full rounded-[10px] border border-stroke bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-cta disabled:cursor-not-allowed disabled:bg-soft disabled:text-ink/70";

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
        className={`${fieldInputClass} ${error ? "border-badge" : ""} ${inputClassName ?? ""}`.trim()}
      />
      {error ? (
        <p id={describedBy} className="mt-1 text-sm font-semibold text-badge">
          {error}
        </p>
      ) : null}
    </div>
  );
}
