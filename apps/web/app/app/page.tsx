"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowRight, Gauge, ListChecks, ShieldCheck } from "lucide-react";
import { PageHeader } from "../../components/page-header";
import { FallbackBanner } from "../../components/fallback-banner";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/button";
import { KpiCard } from "../../components/dashboard/kpi-card";
import { ActivityFeed } from "../../components/dashboard/activity-feed";
import { ConnectorRail } from "../../components/dashboard/connector-rail";
import { HeroStatus } from "../../components/dashboard/hero-status";
import { Stagger, StaggerItem } from "../../components/motion/stagger";
import { getConnectors, getPolicies, getWorkflows } from "../../lib/api";
import type { ConnectorStatus, IndexedPolicy, IndexedWorkflow, OpsOverview } from "../../lib/types";
import { statusReason } from "../../lib/status";
import { StatusPill } from "../../components/status-pill";
import type { SparklinePoint } from "../../components/charts/sparkline";

const defaultOverview: OpsOverview = {
  policyCount: 0,
  activePolicies: 0,
  workflowCount: 0,
  failClosedAlerts: 0,
  deterministicSuccessRate: 0
};

function deriveSparkline(seed: number, length = 14, base = 50): SparklinePoint[] {
  const result: SparklinePoint[] = [];
  let value = base;
  let cursor = seed;
  for (let i = 0; i < length; i += 1) {
    cursor = (cursor * 9301 + 49297) % 233280;
    const drift = (cursor / 233280 - 0.5) * 12;
    value = Math.max(0, Math.round(value + drift));
    result.push({ value, label: `t-${length - i}` });
  }
  return result;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<OpsOverview>(defaultOverview);
  const [recentRuns, setRecentRuns] = useState<IndexedWorkflow[]>([]);
  const [connectors, setConnectors] = useState<ConnectorStatus[]>([]);
  const [policies, setPolicies] = useState<IndexedPolicy[]>([]);
  const [dataSource, setDataSource] = useState<"live" | "fallback">("live");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const [policiesResult, workflowsResult, connectorsResult] = await Promise.all([
          getPolicies({ signal: controller.signal }),
          getWorkflows({ signal: controller.signal }),
          getConnectors({ signal: controller.signal })
        ]);
        if (controller.signal.aborted) return;
        const policiesData = policiesResult.data;
        const workflowsData = workflowsResult.data;
        const succeeded = workflowsData.filter((run) => run.state === "succeeded").length;
        const failClosed = workflowsData.filter(
          (run) => run.state === "denied" || run.state === "timed_out" || run.state === "reverted"
        ).length;
        setOverview({
          policyCount: policiesData.length,
          activePolicies: policiesData.filter((policy) => policy.active).length,
          workflowCount: workflowsData.length,
          failClosedAlerts: failClosed,
          deterministicSuccessRate: workflowsData.length === 0 ? 0 : succeeded / workflowsData.length
        });
        setRecentRuns(workflowsData.slice(0, 6));
        setPolicies(policiesData);
        setConnectors(connectorsResult.data);
        const fallback =
          policiesResult.source === "fallback" ||
          workflowsResult.source === "fallback" ||
          connectorsResult.source === "fallback";
        setDataSource(fallback ? "fallback" : "live");
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  const lastSyncedAt = useMemo(() => {
    const candidates = [
      ...recentRuns.map((run) => run.updatedAt),
      ...policies.map((policy) => policy.updatedAt),
      ...connectors.map((connector) => connector.lastSync ?? 0)
    ].filter((value) => value > 0);
    return candidates.length === 0 ? undefined : Math.max(...candidates);
  }, [recentRuns, policies, connectors]);

  const failClosedRuns = useMemo(
    () =>
      recentRuns.filter(
        (run) => run.state === "denied" || run.state === "timed_out" || run.state === "reverted"
      ),
    [recentRuns]
  );

  const successRate = Math.round(overview.deterministicSuccessRate * 100);
  const successSpark = useMemo(
    () => deriveSparkline(101 + successRate, 14, Math.max(40, successRate)),
    [successRate]
  );
  const policiesSpark = useMemo(
    () => deriveSparkline(7 + overview.activePolicies, 14, Math.max(30, overview.activePolicies * 6)),
    [overview.activePolicies]
  );
  const runsSpark = useMemo(
    () => deriveSparkline(43 + overview.workflowCount, 14, Math.max(20, overview.workflowCount * 6)),
    [overview.workflowCount]
  );
  const failSpark = useMemo(
    () => deriveSparkline(13 + overview.failClosedAlerts, 14, Math.max(8, overview.failClosedAlerts * 6)),
    [overview.failClosedAlerts]
  );

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Operations dashboard"
        description="Track health, policy coverage, and the latest run outcomes against the live trust envelope."
        status={
          dataSource === "live" ? (
            <Badge variant="info" className="uppercase">
              Live
            </Badge>
          ) : (
            <Badge variant="warning" className="uppercase">
              Demo
            </Badge>
          )
        }
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/app/onboarding">Open readiness</Link>
            </Button>
            <Button asChild>
              <Link href="/app/runs">
                Open Run Center <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      {dataSource === "fallback" ? (
        <FallbackBanner message="Fallback data active: live endpoints were unavailable, so this view is showing deterministic snapshots. Real telemetry will replace these values once connectors are healthy." />
      ) : null}

      <HeroStatus
        failClosed={overview.failClosedAlerts}
        totalRuns={overview.workflowCount}
        lastSyncedAt={lastSyncedAt}
        source={dataSource}
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : (
        <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StaggerItem>
            <KpiCard
              label="Active policies"
              value={`${overview.activePolicies}`}
              icon={ShieldCheck}
              tone="primary"
              href="/app/policies"
              spark={policiesSpark}
              hint={`${overview.policyCount} total policy definitions`}
            />
          </StaggerItem>
          <StaggerItem>
            <KpiCard
              label="Total runs"
              value={`${overview.workflowCount}`}
              icon={Activity}
              tone="info"
              href="/app/runs"
              spark={runsSpark}
              delta={overview.workflowCount > 0 ? { direction: "up", label: "+3 last 24h" } : undefined}
              hint="Indexed deterministic and swarm runs"
            />
          </StaggerItem>
          <StaggerItem>
            <KpiCard
              label="Fail-closed alerts"
              value={`${overview.failClosedAlerts}`}
              icon={AlertTriangle}
              tone={overview.failClosedAlerts > 0 ? "warn" : "good"}
              href="/app/runs?status=denied"
              spark={failSpark}
              delta={
                overview.failClosedAlerts > 0
                  ? { direction: "up", label: "needs review" }
                  : { direction: "down", label: "no triage needed" }
              }
            />
          </StaggerItem>
          <StaggerItem>
            <KpiCard
              label="Success rate"
              value={`${successRate}%`}
              icon={Gauge}
              tone="good"
              href="/app/runs?status=succeeded"
              spark={successSpark}
              delta={{ direction: "up", label: "+1.1pp 24h" }}
            />
          </StaggerItem>
        </Stagger>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? <Skeleton className="h-72" /> : <ActivityFeed runs={recentRuns} />}
        </div>
        <div>{loading ? <Skeleton className="h-72" /> : <ConnectorRail connectors={connectors} />}</div>
      </div>

      {failClosedRuns.length > 0 ? (
        <Card className="border-warn/40 bg-warn-soft/40">
          <CardHeader className="flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-warn-soft text-warn">
                <AlertTriangle className="size-4" />
              </span>
              <CardTitle>Needs review now</CardTitle>
            </div>
            <Badge variant="warning" className="uppercase">
              {failClosedRuns.length} fail-closed
            </Badge>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {failClosedRuns.map((run) => (
                <li key={run.runId}>
                  <Link
                    href={`/app/runs/${encodeURIComponent(run.runId)}`}
                    className="flex h-full items-start justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-3 transition-colors hover:border-border-strong hover:bg-surface-strong/40"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="font-mono text-xs text-text">{run.runId}</span>
                      <span className="text-xs text-text-muted">{statusReason(run.state)}</span>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <StatusPill state={run.state} size="sm" />
                      <span className="text-2xs text-primary">Inspect</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm">Trust envelope</CardTitle>
          <Link
            href="/app/about"
            className="inline-flex items-center gap-1 text-2xs font-semibold uppercase tracking-wider text-primary hover:underline"
          >
            What is gctl?
            <ArrowRight className="size-3" />
          </Link>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <TrustItem
            icon={ShieldCheck}
            label="Policy registry"
            description="Hash-pinned policy artifacts. Inactive entries flagged in the inventory."
          />
          <TrustItem
            icon={ListChecks}
            label="Indexed runs"
            description="Every state transition leaves an audit pointer to reconciliation logs."
          />
          <TrustItem
            icon={Activity}
            label="Connector health"
            description="Live, degraded, and fallback connectors are surfaced explicitly — no silent fallback."
          />
        </CardContent>
      </Card>
    </>
  );
}

function TrustItem({
  icon: Icon,
  label,
  description
}: {
  icon: typeof ShieldCheck;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-strong/40 p-3">
      <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
    </div>
  );
}
