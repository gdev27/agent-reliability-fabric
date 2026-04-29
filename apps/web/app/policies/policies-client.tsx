"use client";

import { useState } from "react";
import Link from "next/link";
import { CopyTextButton } from "../../components/copy-text-button";
import { EmptyState } from "../../components/empty-state";
import { FallbackBanner } from "../../components/fallback-banner";
import { PageHeader } from "../../components/page-header";
import { IndexedPolicy } from "../../lib/types";

export function PoliciesClient({
  initialPolicies,
  initialSource
}: {
  initialPolicies: IndexedPolicy[];
  initialSource: "live" | "fallback";
}) {
  const [policies] = useState<IndexedPolicy[]>(initialPolicies);
  const [dataSource] = useState<"live" | "fallback">(initialSource);
  const [amount, setAmount] = useState(10000);
  const [asset, setAsset] = useState("USDC");

  const simulatedDecision =
    amount > 100000
      ? "Escalated path required: private routing and report step enabled."
      : "Safe path selected: batch auction route with standard controls.";

  return (
    <section className="page">
      <PageHeader
        eyebrow="Policy Control"
        title="Policy inventory and routing intent"
        description="Review active policy artifacts and preview how intent size affects safe versus escalated routing."
      />

      <article className="card">
        <div className="card-header">
          <h3>Intent routing preview</h3>
          <p className="muted">
            Preview how an input amount maps to safe or escalated operating posture before reviewing live
            runs.
          </p>
        </div>
        <div className="grid grid-2">
          <label className="field">
            <span className="field-label">Asset symbol</span>
            <input className="input" value={asset} onChange={(event) => setAsset(event.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Amount</span>
            <input
              className="input"
              type="number"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
            />
          </label>
        </div>
        <div className="card card-tight mt-4 support-card">
          <p className="mb-0">
            <strong>Preview decision for {asset}: </strong>
            {simulatedDecision}
          </p>
          <p className="muted mt-2 mb-0">
            This panel is advisory only. Final allow/deny outcomes still come from the policy engine and
            indexed run evidence.
          </p>
          <p className="mb-0 mt-2">
            <Link href="/runs?view=investigation">Open runs for real outcomes</Link>
          </p>
        </div>
      </article>

      {dataSource === "fallback" ? (
        <FallbackBanner message="Fallback data active: policy artifacts are displayed from deterministic snapshots while live data is unavailable." />
      ) : null}

      {policies.length === 0 ? (
        <EmptyState
          title="No policies indexed"
          description="Register policy artifacts to view integrity state and lifecycle status in this control plane."
        />
      ) : (
        <article className="card">
          <div className="card-header row-between">
            <h3>Registered policies</h3>
            <span className="pill neutral">{policies.length} records</span>
          </div>
          <div className="table-wrap">
            <table aria-label="Policies">
              <thead>
                <tr>
                  <th>Policy ID</th>
                  <th>Hash</th>
                  <th className="col-lg">URI</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.policyId}>
                    <td>
                      <div className="row-between">
                        <span className="mono truncate">{policy.policyId}</span>
                        <CopyTextButton value={policy.policyId} />
                      </div>
                    </td>
                    <td>
                      <div className="row-between">
                        <span className="mono truncate">{policy.hash}</span>
                        <CopyTextButton value={policy.hash} />
                      </div>
                    </td>
                    <td className="col-lg">
                      <div className="row-between">
                        <span className="mono truncate">{policy.uri}</span>
                        <CopyTextButton value={policy.uri} />
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${policy.active ? "ok" : "warn"}`}>
                        {policy.active ? "Active" : "Inactive"}
                      </span>
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
