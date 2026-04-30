import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldOff,
  XCircle,
  type LucideIcon
} from "lucide-react";
import { cn } from "../lib/cn";
import { statusLabel, statusReason, statusTone } from "../lib/status";

const pillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-tight",
  {
    variants: {
      tone: {
        ok: "border-good/40 bg-good-soft text-good [&_svg]:text-good",
        warn: "border-warn/40 bg-warn-soft text-warn [&_svg]:text-warn",
        bad: "border-bad/40 bg-bad-soft text-bad [&_svg]:text-bad"
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0 text-2xs",
        lg: "px-3 py-1 text-sm"
      }
    },
    defaultVariants: {
      tone: "ok",
      size: "default"
    }
  }
);

const ICONS: Record<string, LucideIcon> = {
  succeeded: CheckCircle2,
  running: Loader2,
  partial_fill: AlertTriangle,
  timed_out: Clock,
  reverted: ShieldOff,
  denied: XCircle,
  cancelled: XCircle
};

export interface StatusPillProps extends VariantProps<typeof pillVariants> {
  state: string;
  className?: string;
}

export function StatusPill({ state, size, className }: StatusPillProps) {
  const tone = statusTone(state);
  const Icon = ICONS[state] ?? CheckCircle2;
  const isAnimated = state === "running";
  return (
    <span
      className={cn(pillVariants({ tone, size, className }))}
      title={statusReason(state)}
      aria-label={`${statusLabel(state)}. ${statusReason(state)}`}
    >
      <Icon className={cn("size-3.5", isAnimated && "animate-spin")} aria-hidden="true" />
      {statusLabel(state)}
    </span>
  );
}
