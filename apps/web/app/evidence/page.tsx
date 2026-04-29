"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CopyTextButton } from "../../components/copy-text-button";
import { EmptyState } from "../../components/empty-state";
import { FallbackBanner } from "../../components/fallback-banner";
import { PageHeader } from "../../components/page-header";
import { getIdentityEvidence } from "../../lib/api";
import { IdentityEvidence } from "../../lib/types";

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<IdentityEvidence[]>([]);
  const [dataSource, setDataSource] = useState<"live" | "fallback">("live");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvidenceData() {
      try {
        const result = await getIdentityEvidence({ signal: controller.signal });
        if (controller.signal.aborted) {
          return;
        }
        setEvidence(result.data);
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

    void loadEvidenceData();
    return () => controller.abort();
  }, []);

  return (
    <section className="page">
      <PageHeader
        eyebrow="Evidence"
        title="Identity and attestation evidence"
        description="Verify who acted, what was attested, and where audit artifacts are stored."
      />
      <article className="card card-tight">
        <p className="mb-0 muted">
          Evidence rows should map directly to run outcomes. Start from <Link href="/runs">Run Center</Link>{" "}
          when investigating an incident, then use this page to validate identity and attestation metadata.
        </p>
      </article>
      {dataSource === "fallback" ? (
        <FallbackBanner message="Fallback data active: evidence rows are deterministic snapshots and must not be treated as live attestations." />
      ) : null}
      {loading ? (
        <article className="card" role="status" aria-live="polite">
          <p className="muted">Loading identity evidence...</p>
        </article>
      ) : evidence.length === 0 ? (
        <EmptyState
          title="No evidence records yet"
          description="Evidence appears after runs write identity and attestation artifacts to indexed storage."
        />
      ) : (
        <article className="card">
          <div className="table-wrap">
            <table aria-label="Identity and evidence">
              <thead>
                <tr>
                  <th>ENS Name</th>
                  <th>Role</th>
                  <th>Capabilities</th>
                  <th>Attestation</th>
                  <th>Audit Path</th>
                </tr>
              </thead>
              <tbody>
                {evidence.map((row) => (
                  <tr key={row.ensName}>
                    <td>
                      <div className="row-between">
                        <span className="mono">{row.ensName}</span>
                        <CopyTextButton value={row.ensName} />
                      </div>
                    </td>
                    <td>{row.role}</td>
                    <td>{row.capabilities.join(", ")}</td>
                    <td>
                      <div className="row-between">
                        <span className="mono">{row.attestation}</span>
                        <CopyTextButton value={row.attestation} />
                      </div>
                    </td>
                    <td>
                      <div className="row-between">
                        <span className="mono">{row.auditPath}</span>
                        <CopyTextButton value={row.auditPath} />
                      </div>
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
