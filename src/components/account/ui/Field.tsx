/**
 * Account-area field — now a thin re-export of the canonical Design System
 * primitive in `components/ui/Input`. Kept so existing imports
 * (`import { Field, fieldInputClass } from "@/components/account/ui"`) keep
 * working while there is a single source of truth for the input look.
 */
export { Field, inputClass as fieldInputClass } from "@/components/ui/Input";
export type { FieldProps } from "@/components/ui/Input";
