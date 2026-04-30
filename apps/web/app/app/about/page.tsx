import Link from "next/link";
import { ArrowRight, ListChecks, ShieldCheck, Activity, Database, Network, Cog } from "lucide-react";
import { PageHeader } from "../../../components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

const STEPS = [
  {
    label: "Step 1 · Connect",
    title: "Plug in a workspace",
    body: "Create an operator session and verify connector health in Settings."
  },
  {
    label: "Step 2 · Validate",
    title: "Pass the readiness gate",
    body: "Run readiness checks to confirm indexer, policy inventory, and freshness."
  },
  {
    label: "Step 3 · Operate",
    title: "Triage with proofs in view",
    body: "Monitor runs, triage fail-closed outcomes, and inspect evidence records."
  }
];

const CONNECTORS = [
  { icon: Network, label: "Wallet and chain status" },
  { icon: ListChecks, label: "Policy registry lifecycle" },
  { icon: ShieldCheck, label: "ENS identity and delegation" },
  { icon: Activity, label: "KeeperHub run reconciliation" },
  { icon: Database, label: "Indexer trust and freshness telemetry" }
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="What gctl is and how to use it"
        description="gctl is a policy-constrained control plane for autonomous onchain operations with explicit trust evidence."
        breadcrumbs={[{ href: "/app", label: "Console" }, { label: "About" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>What problem this solves</CardTitle>
          <CardDescription>
            Most autonomous execution demos hide policy boundaries and evidence. gctl makes both visible so
            operators and reviewers can understand exactly why a run was allowed, denied, or escalated.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step) => (
          <Card key={step.label}>
            <CardHeader>
              <span className="text-2xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                {step.label}
              </span>
              <CardTitle>{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-muted">{step.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What you can connect</CardTitle>
          <CardDescription>Each integration reports trust status and recovery actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {CONNECTORS.map((connector) => (
              <li
                key={connector.label}
                className="flex items-center gap-3 rounded-md border border-border bg-surface-strong/40 px-3 py-2 text-sm text-text"
              >
                <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <connector.icon className="size-4" />
                </span>
                {connector.label}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href="/app/settings">
                Open connections <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/app/onboarding">Open readiness</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/app/runs">
                Open Run Center <Cog className="size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
