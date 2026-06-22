/**
 * Account-area field helper — now a thin re-export of the canonical Design
 * System primitive in `components/ui/Input`. Kept so existing imports
 * (`import { fieldInputClass } from "@/components/account/ui"`) keep working
 * while there is a single source of truth for the input look.
 */
export { inputClass as fieldInputClass } from "@/components/ui/Input";
export type { FieldProps } from "@/components/ui/Input";
