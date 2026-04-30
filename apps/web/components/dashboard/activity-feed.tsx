import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldOff,
  XCircle,
  type LucideIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../../lib/cn";
import { statusLabel } from "../../lib/status";
import type { IndexedWorkflow } from "../../lib/types";

const STATE_ICON: Record<string, LucideIcon> = {
  succeeded: CheckCircle2,
  running: Loader2,
  partial_fill: AlertTriangle,
  timed_out: Clock,
  reverted: ShieldOff,
  denied: XCircle,
  cancelled: XCircle
};

const STATE_TONE: Record<string, string> = {
  succeeded: "text-good bg-good-soft",
  running: "text-info bg-info-soft",
  partial_fill: "text-warn bg-warn-soft",
  timed_out: "text-warn bg-warn-soft",
  reverted: "text-bad bg-bad-soft",
  denied: "text-bad bg-bad-soft",
  cancelled: "text-text-muted bg-muted"
};

function formatRelative(timestamp: number): string {
  const delta = Date.now() - timestamp;
  if (delta < 60_000) return "just now";
  const minutes = Math.round(delta / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed({ runs }: { runs: IndexedWorkflow[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm">Recent run activity</CardTitle>
        <Link
          href="/app/runs"
          className="inline-flex items-center gap-1 text-2xs font-semibold uppercase tracking-wider text-primary hover:underline"
        >
          View all
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-sm text-text-muted">No recent runs yet.</p>
            <Link
              href="/app/onboarding"
              className="text-2xs font-semibold uppercase tracking-wider text-primary hover:underline"
            >
              Open readiness checks
            </Link>
          </div>
        ) : (
          <ul className="grid gap-1.5">
            {runs.map((run) => {
              const Icon = STATE_ICON[run.state] ?? CheckCircle2;
              const tone = STATE_TONE[run.state] ?? "text-text-muted bg-muted";
              const isAnimated = run.state === "running";
              return (
                <li key={run.runId}>
                  <Link
                    href={`/app/runs/${encodeURIComponent(run.runId)}`}
                    className="group flex items-center gap-3 rounded-md border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-surface-strong/50"
                  >
                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", tone)}>
                      <Icon className={cn("size-4", isAnimated && "animate-spin")} />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate text-sm text-text">
                        <span className="font-mono text-xs">{run.runId}</span>{" "}
                        <span className="text-text-muted">·</span>{" "}
                        <span className="text-text-muted">{run.workflowId}</span>
                      </p>
                      <p className="text-2xs text-text-muted">
                        {statusLabel(run.state)} · {formatRelative(run.updatedAt)}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
