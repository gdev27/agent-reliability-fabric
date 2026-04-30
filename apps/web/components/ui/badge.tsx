import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-border-strong bg-surface-strong text-text",
        primary: "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "border-transparent bg-muted text-text",
        outline: "border-border-strong text-text-muted",
        success: "border-good/40 bg-good-soft text-good [&_svg]:text-good",
        warning: "border-warn/40 bg-warn-soft text-warn [&_svg]:text-warn",
        danger: "border-bad/40 bg-bad-soft text-bad [&_svg]:text-bad",
        info: "border-info/40 bg-info-soft text-info [&_svg]:text-info",
        muted: "border-transparent bg-muted text-text-muted"
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0 text-2xs",
        lg: "px-3 py-1 text-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size, className }))} {...props} />;
}
