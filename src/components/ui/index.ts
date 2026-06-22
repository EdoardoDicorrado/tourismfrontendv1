/**
 * Design System — barrel of the primitives imported via `@/components/ui`.
 * One primitive = one file. NOTE: most consumers import a primitive from its
 * direct path (e.g. `@/components/ui/Button`); this barrel only carries the
 * symbols actually imported through it. Things NOT here on purpose — import them
 * from their own module: the styling helpers `buttonVariants`/`cx` and the
 * prop-types (`@/components/ui/buttonVariants`, `@/components/ui/Badge`, …),
 * `inputClass` (`./Input`), `LANG_TO_COUNTRY`/`flagCountry` (`./lang-flags`),
 * `Popover`/`CardSlider`/`ToastViewport`, and the root `MotionProvider`
 * (`./motion/MotionProvider`). Dead barrel re-exports were pruned (ds task #4).
 */

// Buttons
export { Button, ButtonLink } from "./Button";
export { IconButton } from "./IconButton";

// Data display
export { Badge } from "./Badge";
export { Stars } from "./Stars";
export { Avatar } from "./Avatar";
export { Flag, FlagStack } from "./Flag";

// Form controls
export { Input, Field } from "./Input";
export { Checkbox } from "./Checkbox";
export { Radio } from "./Radio";
export { Switch } from "./Switch";
export { Select } from "./Select";
export { Textarea } from "./Textarea";
export { SearchPill } from "./SearchPill";

// Typography
export { Heading, SectionTitle, Eyebrow } from "./Typography";

// Layout & structure
export { Card } from "./Card";
export { Container } from "./Container";
export { Divider } from "./Divider";
export { Tabs } from "./Tabs";
export { Disclosure } from "./Disclosure";
export { Tooltip } from "./Tooltip";

// Feedback
export { Alert } from "./Alert";
export { Spinner } from "./Spinner";
export { Skeleton } from "./Skeleton";
export { Toast } from "./Toast";
export { EmptyState } from "./EmptyState";
