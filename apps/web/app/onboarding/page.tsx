"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "../../components/empty-state";
import { FallbackBanner } from "../../components/fallback-banner";
import { PageHeader } from "../../components/page-header";
import { getOnboardingChecks } from "../../lib/api";
import { OnboardingCheck } from "../../lib/types";

export default function OnboardingPage() {
  const [checks, setChecks] = useState<OnboardingCheck[]>([]);
  const [dataSource, setDataSource] = useState<"live" | "fallback">("live");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadChecks() {
      try {
        const result = await getOnboardingChecks({ signal: controller.signal });
        if (controller.signal.aborted) {
          return;
        }
        setChecks(result.data);
        setDataSource(result.source);
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

    void loadChecks();
    return () => controller.abort();
  }, []);

  const completedCount = checks.filter((check) => check.status === "ok").length;

  return (
    <section className="page">
      <PageHeader
        eyebrow="Readiness"
        title="Environment readiness checks"
        description="Complete these checks before running operations. A healthy setup should be ready in under two minutes."
      />

      <article className="card feature-card">
        <h3>How to use gctl in under 2 minutes</h3>
        <p className="muted">
          New here? <Link href="/about">Start with the product guide</Link> for a plain-language explanation.
        </p>
        <div className="grid grid-3 mt-2">
          <div className="card card-tight">
            <p className="field-label">Connect</p>
            <p className="mb-0">Create an operator session and review connector health in Settings.</p>
          </div>
          <div className="card card-tight">
            <p className="field-label">Validate</p>
            <p className="mb-0">Confirm indexer, policy inventory, and freshness checks are passing.</p>
          </div>
          <div className="card card-tight">
            <p className="field-label">Operate</p>
            <p className="mb-0">Go to Runs to triage fail-closed outcomes and inspect evidence links.</p>
          </div>
        </div>
        <div className="row mt-4">
          <Link href="/settings" className="btn btn-primary">
            Open settings and connections
          </Link>
          <Link href="/runs" className="btn">
            Open Run Center
          </Link>
        </div>
      </article>

      <article className="card card-tight row-between">
        <div>
          <h3>Checklist progress</h3>
          <p className="muted">
            {completedCount} of {checks.length} checks currently passing.
          </p>
        </div>
        <span className={`pill ${completedCount === checks.length ? "ok" : "warn"}`}>
          {completedCount === checks.length ? "Ready" : "Needs attention"}
        </span>
      </article>

      {dataSource === "fallback" ? (
        <FallbackBanner message="Fallback data active: readiness checks are currently based on deterministic snapshots because live endpoints were unreachable." />
      ) : null}

      {loading ? (
        <article className="card" role="status" aria-live="polite">
          <p className="muted">Loading readiness checks...</p>
        </article>
      ) : checks.length === 0 ? (
        <EmptyState
          title="No checks available"
          description="No readiness checks were returned. Verify connector health and indexer status in Settings."
          ctaHref="/settings"
          ctaLabel="Open settings"
        />
      ) : (
        <div className="grid">
          {checks.map((check) => (
            <article key={check.key} className="card">
              <div className="row-between">
                <h3>{check.label}</h3>
                <span className={`pill ${check.status}`}>
                  {check.status === "ok" ? "Healthy" : check.status === "warn" ? "Review" : "Blocked"}
                </span>
              </div>
              <p className="muted mb-0">{check.detail}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
