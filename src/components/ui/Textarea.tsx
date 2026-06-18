import type { TextareaHTMLAttributes } from "react";

import { cx } from "@/components/ui/buttonVariants";
import { inputClass } from "@/components/ui/Input";

/**
 * Textarea — multi-line input sharing {@link Input}'s look (border/focus/disabled
 * from the same `inputClass`). Server-safe; controlled in a client component.
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cx(inputClass, "min-h-24 resize-y", invalid && "border-badge", className)}
      {...props}
    />
  );
}
