import {
  CheckCircle2,
  Cog,
  FileSearch,
  Network,
  ScrollText,
  ShieldOff,
  Sparkles,
  XCircle,
  type LucideIcon
} from "lucide-react";
import { cn } from "../../lib/cn";
import type { IndexedWorkflow } from "../../lib/types";

type StepKey = "plan" | "validate" | "route" | "execute" | "settle";

interface Step {
  key: StepKey;
  label: string;
  icon: LucideIcon;
  description: string;
}

const STEPS: Step[] = [
  {
    key: "plan",
    label: "Plan",
    icon: Sparkles,
    description: "Planner translates intent into a policy-aware action set."
  },
  {
    key: "validate",
    label: "Validate",
    icon: FileSearch,
    description: "Policy engine evaluates limits, allowlists, and trust signals."
  },
  {
    key: "route",
    label: "Route",
    icon: Network,
    description: "Safe or escalated path is selected. Blocked routes terminate here."
  },
  {
    key: "execute",
    label: "Execute",
    icon: Cog,
    description: "KeeperHub or executor runs the approved action and captures proofs."
  },
  {
    key: "settle",
    label: "Settle",
    icon: ScrollText,
    description: "Reconciliation logs are written and indexed for evidence review."
  }
];

type StepStatus = "complete" | "current" | "blocked" | "skipped" | "pending";

function deriveStatuses(
  state: IndexedWorkflow["state"],
  pathType: IndexedWorkflow["pathType"]
): Record<StepKey, StepStatus> {
  if (state === "succeeded") {
    return {
      plan: "complete",
      validate: "complete",
      route: "complete",
      execute: "complete",
      settle: "complete"
    };
  }
  if (state === "running") {
    return {
      plan: "complete",
      validate: "complete",
      route: "complete",
      execute: "current",
      settle: "pending"
    };
  }
  if (state === "partial_fill") {
    return {
      plan: "complete",
      validate: "complete",
      route: "complete",
      execute: "current",
      settle: "current"
    };
  }
  if (state === "denied") {
    return {
      plan: "complete",
      validate: pathType === "blocked" ? "blocked" : "complete",
      route: "blocked",
      execute: "skipped",
      settle: "skipped"
    };
  }
  if (state === "timed_out") {
    return {
      plan: "complete",
      validate: "complete",
      route: "complete",
      execute: "blocked",
      settle: "skipped"
    };
  }
  if (state === "reverted") {
    return {
      plan: "complete",
      validate: "complete",
      route: "complete",
      execute: "complete",
      settle: "blocked"
    };
  }
  return { plan: "current", validate: "pending", route: "pending", execute: "pending", settle: "pending" };
}

const STATUS_TONE: Record<StepStatus, { bullet: string; ring: string; label: string }> = {
  complete: {
    bullet: "bg-good-soft text-good",
    ring: "ring-good/30",
    label: "text-text"
  },
  current: {
    bullet: "bg-info-soft text-info",
    ring: "ring-info/30",
    label: "text-text"
  },
  blocked: {
    bullet: "bg-bad-soft text-bad",
    ring: "ring-bad/30",
    label: "text-bad"
  },
  skipped: {
    bullet: "bg-muted text-text-muted",
    ring: "ring-border",
    label: "text-text-muted"
  },
  pending: {
    bullet: "bg-muted text-text-muted",
    ring: "ring-border",
    label: "text-text-muted"
  }
};

export interface RunTimelineProps {
  state: IndexedWorkflow["state"];
  pathType?: IndexedWorkflow["pathType"];
  updatedAt: number;
}

export function RunTimeline({ state, pathType, updatedAt }: RunTimelineProps) {
  const statuses = deriveStatuses(state, pathType);
  return (
    <ol className="relative flex flex-col gap-5">
      {STEPS.map((step, index) => {
        const status = statuses[step.key];
        const tone = STATUS_TONE[status];
        const StepIcon =
          status === "complete"
            ? CheckCircle2
            : status === "blocked"
              ? state === "reverted"
                ? ShieldOff
                : XCircle
              : step.icon;
        return (
          <li key={step.key} className="relative grid grid-cols-[28px_1fr] items-start gap-3">
            {index < STEPS.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[13px] top-7 h-[calc(100%+1.25rem)] w-px bg-border",
                  status === "complete" && "bg-good/60"
                )}
              />
            ) : null}
            <span
              className={cn(
                "z-10 flex size-7 items-center justify-center rounded-full ring-2",
                tone.bullet,
                tone.ring
              )}
            >
              <StepIcon className={cn("size-3.5", status === "current" && "animate-pulse-slow")} />
            </span>
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={cn("text-sm font-semibold", tone.label)}>{step.label}</p>
                <span className="text-2xs uppercase tracking-wider text-text-muted">
                  {status === "complete"
                    ? "completed"
                    : status === "current"
                      ? "in progress"
                      : status === "blocked"
                        ? "blocked"
                        : status === "skipped"
                          ? "skipped"
                          : "pending"}
                </span>
              </div>
              <p className="text-xs text-text-muted">{step.description}</p>
              {step.key === "settle" && status === "complete" ? (
                <p className="text-2xs text-text-muted">Last update {new Date(updatedAt).toLocaleString()}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
