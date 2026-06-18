/**
 * Design System — public barrel. Import primitives from `@/components/ui`.
 * One primitive = one file; this just re-exports them for ergonomics.
 *
 * Server Components that need the pure `buttonVariants` styling helper should
 * still import it from `@/components/ui/buttonVariants` directly (importing it
 * through a barrel that also re-exports client components is fine, but the
 * direct path is unambiguous).
 */

// Styling helpers + tokens (pure, server-safe)
export { buttonVariants, cx } from "./buttonVariants";
export type { ButtonVariant, ButtonSize } from "./buttonVariants";

// Buttons
export { Button, ButtonLink } from "./Button";
export { IconButton } from "./IconButton";
export type { IconButtonVariant, IconButtonSize, IconButtonProps } from "./IconButton";

// Data display
export { Badge } from "./Badge";
export type { BadgeVariant, BadgeTone, BadgeSize, BadgeProps } from "./Badge";
export { Stars } from "./Stars";
export { Avatar } from "./Avatar";

// Form controls
export { Input, Field, inputClass } from "./Input";
export type { InputProps, FieldProps } from "./Input";
export { Checkbox } from "./Checkbox";
export type { CheckboxProps } from "./Checkbox";
export { Radio } from "./Radio";
export type { RadioProps } from "./Radio";
export { Switch } from "./Switch";
export { Select } from "./Select";
export type { SelectProps } from "./Select";
export { Textarea } from "./Textarea";
export type { TextareaProps } from "./Textarea";

// Typography
export { Heading, SectionTitle, Eyebrow } from "./Typography";

// Layout & structure
export { Container } from "./Container";
export { Divider } from "./Divider";
export { Tabs } from "./Tabs";
export type { TabItem } from "./Tabs";
export { Disclosure } from "./Disclosure";
export { CardSlider } from "./CardSlider";
export { Popover } from "./Popover";
export { Tooltip } from "./Tooltip";

// Feedback
export { Alert } from "./Alert";
export type { AlertVariant } from "./Alert";
export { Spinner } from "./Spinner";
export { Skeleton } from "./Skeleton";
export { Toast, ToastViewport } from "./Toast";
export type { ToastVariant } from "./Toast";
