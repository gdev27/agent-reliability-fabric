import Link from "next/link";
import { ArrowRight, CircleDot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../../lib/cn";
import type { ConnectorStatus } from "../../lib/types";

const HEALTH_TONE = {
  connected: { dot: "text-good", label: "text-good" },
  degraded: { dot: "text-warn", label: "text-warn" },
  disconnected: { dot: "text-bad", label: "text-bad" }
} as const;

export function ConnectorRail({ connectors }: { connectors: ConnectorStatus[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm">Connector health</CardTitle>
        <Link
          href="/app/settings"
          className="inline-flex items-center gap-1 text-2xs font-semibold uppercase tracking-wider text-primary hover:underline"
        >
          Manage
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2">
          {connectors.map((connector) => {
            const tone = HEALTH_TONE[connector.health];
            return (
              <li
                key={connector.key}
                className="flex items-start gap-3 rounded-md border border-transparent px-2 py-2 transition-colors hover:bg-surface-strong/40 hover:border-border"
              >
                <CircleDot className={cn("mt-0.5 size-3.5 shrink-0", tone.dot)} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm text-text">{connector.label}</p>
                    <span className={cn("text-2xs font-semibold uppercase tracking-wider", tone.label)}>
                      {connector.health}
                    </span>
                  </div>
                  <p className="truncate text-xs text-text-muted">{connector.detail}</p>
                  {connector.lastSync ? (
                    <p className="text-2xs text-text-muted">Last sync {formatRelative(connector.lastSync)}</p>
                  ) : (
                    <p className="text-2xs text-warn">{connector.recoveryAction}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
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
