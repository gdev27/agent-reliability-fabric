import Link from "next/link";
import { PageHeader } from "../../components/page-header";

export default function AboutPage() {
  return (
    <section className="page">
      <PageHeader
        eyebrow="About"
        title="What gctl is and how to use it"
        description="gctl is a policy-constrained control plane for autonomous onchain operations with explicit trust evidence."
      />

      <article className="card feature-card">
        <h3>What problem this solves</h3>
        <p className="muted mb-0">
          Most autonomous execution demos hide policy boundaries and evidence. gctl makes both visible so
          operators and reviewers can understand exactly why a run was allowed, denied, or escalated.
        </p>
      </article>

      <div className="grid grid-3">
        <article className="card">
          <h3>Step 1: Connect</h3>
          <p className="muted mb-0">Create an operator session and verify connector health in Settings.</p>
        </article>
        <article className="card">
          <h3>Step 2: Validate</h3>
          <p className="muted mb-0">
            Run readiness checks to confirm indexer, policy inventory, and freshness.
          </p>
        </article>
        <article className="card">
          <h3>Step 3: Operate</h3>
          <p className="muted mb-0">
            Monitor runs, triage fail-closed outcomes, and inspect evidence records.
          </p>
        </article>
      </div>

      <article className="card">
        <h3>What you can connect</h3>
        <ul className="muted run-recovery-list">
          <li>Wallet and chain status</li>
          <li>Policy registry lifecycle</li>
          <li>ENS identity and delegation</li>
          <li>KeeperHub run reconciliation</li>
          <li>Indexer trust and freshness telemetry</li>
        </ul>
        <div className="row mt-4">
          <Link href="/settings" className="btn btn-primary">
            Open connections
          </Link>
          <Link href="/onboarding" className="btn">
            Open readiness
          </Link>
          <Link href="/runs" className="btn">
            Open Run Center
          </Link>
        </div>
      </article>
    </section>
  );
}
