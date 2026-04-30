"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowDown,
  Brain,
  Compass,
  ScanSearch,
  Sparkles,
  Workflow,
  type LucideIcon
} from "lucide-react";
import { PageHeader } from "../../../components/page-header";
import { FallbackBanner } from "../../../components/fallback-banner";
import { EmptyState } from "../../../components/empty-state";
import { StatusPill } from "../../../components/status-pill";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { getWorkflows } from "../../../lib/api";
import type { IndexedWorkflow } from "../../../lib/types";
import { RUN_PATH_LABELS } from "../../../lib/ui-constants";

type RoleId = "planner" | "researcher" | "critic" | "executor";

const ROLES: { id: RoleId; role: string; job: string; icon: LucideIcon }[] = [
  {
    id: "planner",
    role: "Planner",
    job: "Creates policy-aware intent from treasury objective.",
    icon: Compass
  },
  {
    id: "researcher",
    role: "Researcher",
    job: "Enriches context with market and risk signals.",
    icon: ScanSearch
  },
  {
    id: "critic",
    role: "Critic",
    job: "Challenges unsafe plans and requests revision.",
    icon: Brain
  },
  {
    id: "executor",
    role: "Executor",
    job: "Runs approved actions through KeeperHub and records proofs.",
    icon: Workflow
  }
];

export default function SwarmPage() {
  const [runs, setRuns] = useState<IndexedWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"live" | "fallback">("live");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      const result = await getWorkflows({ signal: controller.signal });
      if (controller.signal.aborted) return;
      setRuns(result.data);
      setDataSource(result.source);
      setLoading(false);
    })();
    return () => controller.abort();
  }, []);

  const latestRun = useMemo(() => runs[0] ?? null, [runs]);
  const roleOutput = useMemo<Record<RoleId, string>>(() => {
    const latestPathType = latestRun?.pathType ?? "safe";
    const pathLabel = RUN_PATH_LABELS[latestPathType] ?? "Unclassified";
    return {
      planner: `Latest path preference: ${pathLabel}.`,
      researcher:
        latestPathType === "escalated"
          ? "Risk signals elevated this route."
          : "Market context supports current route.",
      critic:
        latestRun?.state === "denied"
          ? "Unsafe path blocked. Revision required."
          : "No veto required on latest reviewed intent.",
      executor: latestRun
        ? `Most recent run ${latestRun.runId} is ${latestRun.state}.`
        : "No execution records yet."
    };
  }, [latestRun]);

  return (
    <>
      <PageHeader
        eyebrow="Swarm loop"
        title="Role-by-role execution lifecycle"
        description="Understand each role, then jump directly into run evidence linked to the latest swarm outcomes."
        breadcrumbs={[{ href: "/app", label: "Console" }, { label: "Swarm" }]}
        status={
          <Badge variant="muted">
            <Sparkles className="size-3.5" />4 roles
          </Badge>
        }
      />

      {dataSource === "fallback" ? (
        <FallbackBanner message="Fallback data active: swarm activity currently reflects deterministic snapshots while live execution feeds are unavailable." />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Loop visualization</CardTitle>
          <CardDescription>
            Each role outputs evidence the next role consumes. Critic veto flips the loop back to the planner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 md:grid-cols-4">
            {ROLES.map((role, index) => (
              <li
                key={role.id}
                className="relative flex flex-col gap-2 rounded-lg border border-border bg-surface-strong/40 p-4"
              >
                <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <role.icon className="size-4" />
                </span>
                <p className="text-sm font-semibold text-text">{role.role}</p>
                <p className="text-xs text-text-muted">{role.job}</p>
                {index < ROLES.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-text-muted md:inline-flex"
                  >
                    <ArrowRight className="size-4" />
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-2 left-1/2 hidden -translate-x-1/2 text-text-muted md:inline-flex"
                  >
                    <ArrowDown className="size-4" />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {ROLES.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <role.icon className="size-4" />
                </span>
                <div>
                  <CardTitle>{role.role}</CardTitle>
                  <CardDescription>{role.job}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-1">
              <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                Latest contribution
              </p>
              <p className="text-sm text-text">{roleOutput[role.id]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <Skeleton className="h-32" />
      ) : latestRun ? (
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Latest swarm-linked run</CardTitle>
              <CardDescription>
                Connect role outputs with the policy decision, final state, and audit evidence.
              </CardDescription>
            </div>
            <StatusPill state={latestRun.state} />
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm text-text">{latestRun.runId}</span>
            <Badge variant="muted" className="uppercase">
              {latestRun.pathType ? RUN_PATH_LABELS[latestRun.pathType] : "Unclassified"}
            </Badge>
            <Button asChild className="ml-auto">
              <Link href={`/app/runs/${encodeURIComponent(latestRun.runId)}`}>
                Open run evidence <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No swarm-linked runs yet"
          description="Run deterministic or swarm flows, then return to inspect role outcomes with evidence links."
          ctaHref="/app/runs"
          ctaLabel="Open Run Center"
        />
      )}
    </>
  );
}
