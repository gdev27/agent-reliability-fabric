"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "../../components/empty-state";
import { FallbackBanner } from "../../components/fallback-banner";
import { PageHeader } from "../../components/page-header";
import { pinRunForSession } from "../../lib/api";
import { IndexedWorkflow } from "../../lib/types";
import { StatusPill } from "../../components/status-pill";
import { statusReason } from "../../lib/status";
import { RUN_FILTER_LABELS, RUN_PATH_LABELS } from "../../lib/ui-constants";

const filterLabels = RUN_FILTER_LABELS;
const pathLabels = RUN_PATH_LABELS;

function RunsClientInner({
  initialRuns,
  initialSource
}: {
  initialRuns: IndexedWorkflow[];
  initialSource: "live" | "fallback";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [runs] = useState<IndexedWorkflow[]>(initialRuns);
  const [dataSource] = useState<"live" | "fallback">(initialSource);
  const [sessionView, setSessionView] = useState<"overview" | "investigation">("overview");
  const [pinMessage, setPinMessage] = useState("");
  const filter = useMemo<keyof typeof filterLabels>(() => {
    const status = searchParams.get("status");
    return status && status in filterLabels ? (status as keyof typeof filterLabels) : "all";
  }, [searchParams]);

  function onFilterChange(nextFilter: keyof typeof filterLabels) {
    const nextSearch = new URLSearchParams(searchParams.toString());
    if (nextFilter === "all") {
      nextSearch.delete("status");
    } else {
      nextSearch.set("status", nextFilter);
    }
    const query = nextSearch.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const visibleRuns = useMemo(() => {
    if (filter === "all") {
      return runs;
    }
    return runs.filter((run) => run.state === filter);
  }, [filter, runs]);

  const failClosedCount = useMemo(
    () =>
      runs.filter((run) => run.state === "denied" || run.state === "timed_out" || run.state === "reverted")
        .length,
    [runs]
  );

  useEffect(() => {
    function syncMode() {
      const stored = searchParams.get("view");
      if (stored === "investigation" || stored === "overview") {
        setSessionView(stored);
        return;
      }
      const fromStorage =
        typeof window !== "undefined" ? window.localStorage.getItem("gctl.session.viewMode") : null;
      setSessionView(fromStorage === "investigation" ? "investigation" : "overview");
    }
    syncMode();
    window.addEventListener("storage", syncMode);
    window.addEventListener("gctl:settings-updated", syncMode);
    return () => {
      window.removeEventListener("storage", syncMode);
      window.removeEventListener("gctl:settings-updated", syncMode);
    };
  }, [searchParams]);

  async function pinRun(runId: string) {
    const result = await pinRunForSession(runId);
    setPinMessage(
      result.session ? `Pinned ${runId} to your workspace.` : "Sign in from Settings to save pinned runs."
    );
  }

  return (
    <section className="page">
      <PageHeader
        eyebrow="Run Center"
        title="Execution timeline and triage"
        description="Find risky outcomes quickly, understand why they occurred, and drill into evidence for each run."
      />
      <div className="card card-tight row-between">
        <label htmlFor="statusFilter" className="field mb-0">
          <span className="field-label">Filter by status</span>
          <select
            id="statusFilter"
            className="select"
            value={filter}
            onChange={(event) => onFilterChange(event.target.value as keyof typeof filterLabels)}
          >
            {Object.entries(filterLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <span className="pill neutral">{visibleRuns.length} matching runs</span>
      </div>

      {dataSource === "fallback" ? (
        <FallbackBanner message="Fallback data active: run records are currently rendered from deterministic snapshots instead of live execution feeds." />
      ) : null}

      <article className="card card-tight row-between">
        <div>
          <h3>Fail-closed outcomes</h3>
          <p className="muted">Denied, reverted, or timed-out runs requiring operator review.</p>
        </div>
        <span className={`pill ${failClosedCount > 0 ? "warn" : "ok"}`}>{failClosedCount}</span>
      </article>

      {pinMessage ? <article className="card card-tight muted">{pinMessage}</article> : null}

      {visibleRuns.length === 0 ? (
        <EmptyState
          title="No runs match this filter"
          description="Try another status filter, or verify readiness and connector health before re-running."
          ctaHref="/onboarding"
          ctaLabel="Open readiness checks"
        />
      ) : (
        <article className="card">
          <div className="table-wrap">
            <table aria-label="Runs">
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th className="col-md">Workflow</th>
                  {sessionView === "investigation" ? <th>Path</th> : null}
                  <th>Status</th>
                  {sessionView === "investigation" ? <th>Reason</th> : null}
                  {sessionView === "investigation" ? <th className="col-lg">Audit Path</th> : null}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRuns.map((run) => (
                  <tr key={run.runId}>
                    <td className="mono cell-id">
                      <Link href={`/runs/${run.runId}`} aria-label={`Open details for run ${run.runId}`}>
                        {run.runId}
                      </Link>
                    </td>
                    <td className="col-md">{run.workflowId}</td>
                    {sessionView === "investigation" ? (
                      <td>{run.pathType ? pathLabels[run.pathType] : "Not classified"}</td>
                    ) : null}
                    <td>
                      <StatusPill state={run.state} />
                    </td>
                    {sessionView === "investigation" ? (
                      <td className="muted cell-reason">{statusReason(run.state)}</td>
                    ) : null}
                    {sessionView === "investigation" ? (
                      <td className="mono cell-path col-lg">{run.auditPath}</td>
                    ) : null}
                    <td>
                      <button type="button" className="btn btn-sm" onClick={() => pinRun(run.runId)}>
                        Pin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}
    </section>
  );
}

export function RunsClient(props: { initialRuns: IndexedWorkflow[]; initialSource: "live" | "fallback" }) {
  return (
    <Suspense
      fallback={
        <article className="card">
          <p className="muted">Loading run filters...</p>
        </article>
      }
    >
      <RunsClientInner {...props} />
    </Suspense>
  );
}
