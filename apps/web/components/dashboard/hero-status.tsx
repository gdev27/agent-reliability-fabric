import { CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/cn";

export interface HeroStatusProps {
  failClosed: number;
  totalRuns: number;
  lastSyncedAt?: number;
  source: "live" | "fallback";
  className?: string;
}

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

export function HeroStatus({ failClosed, totalRuns, lastSyncedAt, source, className }: HeroStatusProps) {
  const healthy = failClosed === 0;
  return (
    <Card className={cn("border-l-4", healthy ? "border-l-good" : "border-l-warn", className)}>
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              healthy ? "bg-good-soft text-good" : "bg-warn-soft text-warn"
            )}
          >
            {healthy ? <CheckCircle2 className="size-5" /> : <AlertTriangle className="size-5" />}
          </span>
          <div>
            <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              System status
            </p>
            <p className="text-base font-semibold text-text">
              {healthy
                ? "All systems healthy"
                : `${failClosed} fail-closed run${failClosed === 1 ? "" : "s"} need review`}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              Tracking {totalRuns} indexed runs across deterministic and swarm flows.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
          <Badge variant={source === "live" ? "info" : "warning"} className="uppercase">
            <RefreshCw className="size-3" />
            {source === "live" ? "Live data" : "Demo data"}
          </Badge>
          {lastSyncedAt ? <Badge variant="muted">Synced {formatRelative(lastSyncedAt)}</Badge> : null}
        </div>
      </CardContent>
    </Card>
  );
}
