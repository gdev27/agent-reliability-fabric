"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Cog,
  Loader2,
  PlayCircle,
  ShieldCheck,
  TriangleAlert,
  XCircle,
  type LucideIcon
} from "lucide-react";
import { PageHeader } from "../../../components/page-header";
import { FallbackBanner } from "../../../components/fallback-banner";
import { EmptyState } from "../../../components/empty-state";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { getOnboardingChecks } from "../../../lib/api";
import type { OnboardingCheck } from "../../../lib/types";
import { cn } from "../../../lib/cn";

const STATUS_CONFIG: Record<
  OnboardingCheck["status"],
  { label: string; tone: "success" | "warning" | "danger"; icon: LucideIcon; classNames: string }
> = {
  ok: {
    label: "Healthy",
    tone: "success",
    icon: CheckCircle2,
    classNames: "bg-good-soft text-good"
  },
  warn: {
    label: "Review",
    tone: "warning",
    icon: TriangleAlert,
    classNames: "bg-warn-soft text-warn"
  },
  bad: {
    label: "Blocked",
    tone: "danger",
    icon: XCircle,
    classNames: "bg-bad-soft text-bad"
  }
};

const STEPS = [
  {
    label: "1 · Connect",
    title: "Operator session",
    body: "Create an operator session in Settings to sync workspace preferences across browsers.",
    icon: ShieldCheck,
    href: "/app/settings"
  },
  {
    label: "2 · Validate",
    title: "Readiness checks",
    body: "Confirm indexer, policy inventory, and freshness before running any operations.",
    icon: Cog,
    href: "#checks"
  },
  {
    label: "3 · Operate",
    title: "Triage runs",
    body: "Open Run Center to inspect outcomes and recover fail-closed flows.",
    icon: PlayCircle,
    href: "/app/runs"
  }
];

export default function OnboardingPage() {
  const [checks, setChecks] = useState<OnboardingCheck[]>([]);
  const [dataSource, setDataSource] = useState<"live" | "fallback">("live");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const result = await getOnboardingChecks({ signal: controller.signal });
        if (controller.signal.aborted) return;
        setChecks(result.data);
        setDataSource(result.source);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  const completedCount = useMemo(() => checks.filter((check) => check.status === "ok").length, [checks]);
  const totalCount = checks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const ready = totalCount > 0 && completedCount === totalCount;

  async function rerunChecks() {
    setRunning(true);
    try {
      const result = await getOnboardingChecks();
      setChecks(result.data);
      setDataSource(result.source);
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Readiness"
        title="Environment readiness checks"
        description="Complete these checks before running operations. A healthy setup should be ready in under two minutes."
        breadcrumbs={[{ href: "/app", label: "Console" }, { label: "Readiness" }]}
        status={<Badge variant={ready ? "success" : "warning"}>{ready ? "Ready" : "Needs attention"}</Badge>}
        actions={
          <Button onClick={rerunChecks} disabled={running}>
            {running ? <Loader2 className="size-4 animate-spin" /> : <PlayCircle className="size-4" />}
            Run all checks
          </Button>
        }
      />

      {dataSource === "fallback" ? (
        <FallbackBanner message="Fallback data active: readiness checks are currently based on deterministic snapshots because live endpoints were unreachable." />
      ) : null}

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-3 gap-2">
            {STEPS.map((step, index) => (
              <div
                key={step.label}
                className={cn(
                  "flex flex-col gap-1 rounded-md border border-border bg-surface-strong/40 p-3",
                  index === 0 && "border-l-4 border-l-primary"
                )}
              >
                <span className="text-2xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  {step.label}
                </span>
                <span className="text-sm font-medium text-text">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="flex items-center gap-3">
              <div
                className="flex size-12 items-center justify-center rounded-full text-text"
                style={{
                  background: `conic-gradient(var(--color-primary) ${progress}%, var(--color-muted) 0)`
                }}
                aria-label={`Progress ${progress}%`}
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-surface text-text">
                  <span className="text-2xs font-semibold">{progress}%</span>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium text-text">
                  {completedCount} / {totalCount || "–"}
                </p>
                <p className="text-2xs text-text-muted">checks passing</p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/app/runs">
                Skip to runs <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section id="checks" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : checks.length === 0 ? (
          <EmptyState
            title="No checks available"
            description="No readiness checks were returned. Verify connector health and indexer status in Settings."
            ctaHref="/app/settings"
            ctaLabel="Open settings"
            className="md:col-span-2 xl:col-span-3"
          />
        ) : (
          checks.map((check) => {
            const config = STATUS_CONFIG[check.status];
            const StatusIcon = config.icon;
            return (
              <Card key={check.key} className="h-full">
                <CardHeader className="flex-row items-start justify-between gap-3 pb-2">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn("flex size-9 items-center justify-center rounded-md", config.classNames)}
                    >
                      <StatusIcon className="size-4" />
                    </span>
                    <div>
                      <CardTitle className="text-sm">{check.label}</CardTitle>
                      <CardDescription>{config.label}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={config.tone} size="sm">
                    {config.label}
                  </Badge>
                </CardHeader>
                <CardContent className="text-sm text-text-muted">{check.detail}</CardContent>
              </Card>
            );
          })
        )}
      </section>
    </>
  );
}
