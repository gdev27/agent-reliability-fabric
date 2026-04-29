"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/empty-state";
import { FallbackBanner } from "../../components/fallback-banner";
import { PageHeader } from "../../components/page-header";
import { getWorkflows } from "../../lib/api";
import { IndexedWorkflow } from "../../lib/types";
import { StatusPill } from "../../components/status-pill";

const roleDefinitions = [
  { id: "planner", role: "Planner", job: "Creates policy-aware intent from treasury objective." },
  { id: "researcher", role: "Researcher", job: "Enriches context with market and risk signals." },
  { id: "critic", role: "Critic", job: "Challenges unsafe plans and requests revision." },
  { id: "executor", role: "Executor", job: "Runs approved actions through KeeperHub and records proofs." }
] as const;

export default function SwarmPage() {
  const [runs, setRuns] = useState<IndexedWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"live" | "fallback">("live");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      const result = await getWorkflows({ signal: controller.signal });
      if (controller.signal.aborted) {
        return;
      }
      setRuns(result.data);
      setDataSource(result.source);
      setLoading(false);
    })();
    return () => controller.abort();
  }, []);

  const latestRun = useMemo(() => runs[0] || null, [runs]);
  const roleOutput = useMemo(() => {
    const latestPathType = latestRun?.pathType || "safe";
    return {
      planner: `Latest path preference: ${latestPathType}.`,
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
    <section className="page">
      <PageHeader
        eyebrow="Swarm Loop"
        title="Role-by-role execution lifecycle"
        description="Understand each role, then jump directly into run evidence linked to the latest swarm outcomes."
      />

      {dataSource === "fallback" ? (
        <FallbackBanner message="Fallback data active: swarm activity currently reflects deterministic snapshots while live execution feeds are unavailable." />
      ) : null}

      <div className="grid grid-2">
        {roleDefinitions.map((role) => (
          <article key={role.id} className="card">
            <h3>{role.role}</h3>
            <p className="muted">{role.job}</p>
            <p className="field-label">Latest observed contribution</p>
            <p className="mb-0">{roleOutput[role.id]}</p>
          </article>
        ))}
      </div>

      {loading ? (
        <article className="card">
          <p className="muted">Loading swarm activity...</p>
        </article>
      ) : latestRun ? (
        <article className="card">
          <div className="row-between">
            <div>
              <h3>Latest swarm-linked run</h3>
              <p className="muted mb-0">
                Use this to connect role outputs with policy decisions, final state, and audit evidence.
              </p>
            </div>
            <StatusPill state={latestRun.state} />
          </div>
          <div className="row mt-2">
            <span className="mono">{latestRun.runId}</span>
            <Link href={`/runs/${latestRun.runId}`} className="btn btn-primary">
              Open run evidence
            </Link>
          </div>
        </article>
      ) : (
        <EmptyState
          title="No swarm-linked runs yet"
          description="Run deterministic or swarm flows, then return to inspect role outcomes with evidence links."
          ctaHref="/runs"
          ctaLabel="Open Run Center"
        />
      )}
    </section>
  );
}
