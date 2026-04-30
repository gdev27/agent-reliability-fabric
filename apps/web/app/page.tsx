import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Github,
  Activity,
  ShieldCheck,
  ListChecks,
  Network,
  Sparkles,
  Database,
  Fingerprint,
  Workflow
} from "lucide-react";
import type { Metadata } from "next";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Logo, LogoGlyph } from "../components/brand/logo";
import { ThemeToggle } from "../components/shell/theme-toggle";

export const metadata: Metadata = {
  title: "gctl — policy-constrained autonomy you can prove",
  description:
    "gctl is a policy-constrained control plane for autonomous onchain operations. Run, prove, and review every decision against signed policy.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "gctl — policy-constrained autonomy you can prove",
    description:
      "Run, prove, and review every autonomous onchain decision against signed policy. ENS identity, 0G attestation, KeeperHub reconciliation.",
    siteName: "gctl",
    type: "website",
    images: ["/og.svg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "gctl — policy-constrained autonomy you can prove",
    description: "Run, prove, and review every autonomous onchain decision against signed policy.",
    images: ["/og.svg"]
  }
};

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Policy as the substrate",
    detail:
      "Every action is bound by a signed, hash-pinned policy. Outcomes are allowed, denied, escalated, or reverted — never ambiguous."
  },
  {
    icon: Fingerprint,
    title: "ENS identity per role",
    detail:
      "Planner, researcher, critic, and executor each hold a verifiable ENS identity. You see exactly who attested to a decision."
  },
  {
    icon: Database,
    title: "0G attestation + audit",
    detail:
      "Run evidence is captured on 0G with reconciliation through KeeperHub. Every cell on the dashboard maps to a proof artifact."
  }
];

const HOW = [
  {
    label: "1 · Connect",
    title: "Plug in a workspace",
    body: "Verify wallet, policy registry, ENS identity, KeeperHub, and indexer connectors in under two minutes."
  },
  {
    label: "2 · Validate",
    title: "Pass the readiness gate",
    body: "Each connector reports trust status and recovery actions. No silent fallback, ever."
  },
  {
    label: "3 · Operate",
    title: "Triage with the proofs in view",
    body: "Run Center surfaces fail-closed runs first. Drill into the decision path, evidence, and replay logs."
  }
];

const KPI_PREVIEW = [
  { label: "Active policies", value: "12", delta: "+2 this week", tone: "good" as const },
  { label: "Run success rate", value: "97.4%", delta: "+1.1pp 24h", tone: "good" as const },
  { label: "Fail-closed alerts", value: "1", delta: "down from 4", tone: "warn" as const },
  { label: "Median TTR", value: "44s", delta: "-12s 24h", tone: "info" as const }
];

const KPI_TONE: Record<string, string> = {
  good: "text-good",
  warn: "text-warn",
  info: "text-info"
};

export default function MarketingLanding() {
  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <header className="relative z-10 mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-6 lg:px-8">
        <Link
          href="/"
          aria-label="gctl home"
          className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo size={28} />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-text-muted md:flex">
          <a href="#pillars" className="transition-colors hover:text-text">
            Trust pillars
          </a>
          <a href="#how" className="transition-colors hover:text-text">
            How it works
          </a>
          <a href="#preview" className="transition-colors hover:text-text">
            Console preview
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="icon" aria-label="GitHub repository">
            <Link href="https://github.com/0xgctl/gctl" target="_blank" rel="noopener noreferrer">
              <Github className="size-4" />
            </Link>
          </Button>
          <Button asChild>
            <Link href="/app">
              Open dashboard
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative mx-auto flex w-full max-w-[1280px] flex-col items-start gap-10 px-4 pb-16 pt-8 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:pb-24 lg:pt-12">
        <div className="flex flex-1 flex-col gap-6 motion-safe-only animate-rise">
          <Badge variant="muted" className="border border-border-strong/40">
            <Sparkles className="size-3.5 text-primary" /> Built for institutional autonomy
          </Badge>
          <h1 className="text-balance font-display text-display-lg font-semibold tracking-[-0.03em] text-text lg:text-display-xl">
            Policy-constrained autonomy you can prove.
          </h1>
          <p className="max-w-xl text-balance text-base text-text-muted lg:text-lg">
            gctl is the control plane for autonomous onchain operations. Every decision routes through signed
            policy, attested identity, and indexed evidence — so reviewers can replay the why, not just the
            what.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/app">
                Open dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/app/onboarding">View readiness</Link>
            </Button>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-muted">
            <li className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4 text-good" /> 0G attestation
            </li>
            <li className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4 text-good" /> ENS identity
            </li>
            <li className="inline-flex items-center gap-2">
              <CheckCircle2 className="size-4 text-good" /> KeeperHub reconciliation
            </li>
          </ul>
        </div>

        <div className="relative w-full max-w-md flex-1 lg:max-w-lg">
          <div
            aria-hidden="true"
            className="absolute -inset-12 -z-10 rounded-full bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--color-primary)_22%,transparent),transparent_70%)]"
          />
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface/80 p-6 shadow-overlay backdrop-blur">
            <div className="flex items-center justify-between text-2xs uppercase tracking-wider text-text-muted">
              <span>Console preview</span>
              <Badge variant="success" size="sm">
                Healthy
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {KPI_PREVIEW.map((kpi) => (
                <div key={kpi.label} className="rounded-lg border border-border bg-surface-strong/60 p-3">
                  <p className="text-2xs uppercase tracking-wider text-text-muted">{kpi.label}</p>
                  <p className="mt-1 font-display text-display-sm font-semibold text-text">{kpi.value}</p>
                  <p className={`text-2xs ${KPI_TONE[kpi.tone] ?? "text-text-muted"}`}>{kpi.delta}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-surface-strong/40 p-3">
              <LogoGlyph size={36} className="text-primary" />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-text">policy.lattice</p>
                <p className="text-2xs text-text-muted">Safe path · escalated path · blocked</p>
              </div>
              <ArrowRight className="ml-auto size-4 text-text-muted" />
            </div>
          </div>
        </div>
      </section>

      <section
        id="pillars"
        className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-10 border-t border-border px-4 py-16 lg:px-8 lg:py-24"
      >
        <div className="flex flex-col gap-2">
          <span className="text-2xs font-semibold uppercase tracking-[0.18em] text-text-muted">
            Trust pillars
          </span>
          <h2 className="font-display text-display-md font-semibold tracking-tight text-text">
            Three artifacts behind every action
          </h2>
          <p className="max-w-3xl text-text-muted">
            We don&rsquo;t hide policy boundaries behind a UI. Each pillar surfaces evidence directly so
            operators and reviewers can interrogate every outcome.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <Card key={pillar.title}>
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <pillar.icon className="size-5" />
                </div>
                <CardTitle className="text-text">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-muted">{pillar.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="how"
        className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-10 border-t border-border px-4 py-16 lg:px-8 lg:py-24"
      >
        <div className="flex flex-col gap-2">
          <span className="text-2xs font-semibold uppercase tracking-[0.18em] text-text-muted">
            How it works
          </span>
          <h2 className="font-display text-display-md font-semibold tracking-tight text-text">
            From plug-in to proof in three steps
          </h2>
        </div>
        <ol className="grid gap-4 lg:grid-cols-3">
          {HOW.map((step, index) => (
            <li
              key={step.label}
              className="relative flex flex-col gap-3 rounded-xl border border-border bg-surface p-6 shadow-card"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/12 text-primary">
                {index === 0 ? (
                  <Workflow className="size-4" />
                ) : index === 1 ? (
                  <ListChecks className="size-4" />
                ) : (
                  <Activity className="size-4" />
                )}
              </span>
              <span className="text-2xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                {step.label}
              </span>
              <h3 className="font-display text-lg font-semibold tracking-tight text-text">{step.title}</h3>
              <p className="text-sm text-text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="preview"
        className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-6 border-t border-border px-4 py-16 lg:px-8 lg:py-24"
      >
        <div className="flex flex-col gap-2">
          <span className="text-2xs font-semibold uppercase tracking-[0.18em] text-text-muted">
            Console preview
          </span>
          <h2 className="font-display text-display-md font-semibold tracking-tight text-text">
            Surface the proof, not the prose
          </h2>
          <p className="max-w-3xl text-text-muted">
            The cockpit makes trust visible: hero status band, KPI trends, recent runs, and a connector rail
            that tells you why each integration is healthy or degraded.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-gradient-to-b from-surface to-surface-strong/40 p-3">
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted">Operations</p>
                <h3 className="font-display text-lg font-semibold text-text">Operations dashboard</h3>
              </div>
              <Badge variant="success">
                <CheckCircle2 className="size-3.5" /> All systems healthy
              </Badge>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {KPI_PREVIEW.map((kpi) => (
                <div
                  key={`${kpi.label}-large`}
                  className="rounded-lg border border-border bg-surface-strong/40 p-4"
                >
                  <p className="text-2xs uppercase tracking-wider text-text-muted">{kpi.label}</p>
                  <p className="mt-1 font-display text-display-sm font-semibold text-text">{kpi.value}</p>
                  <p className={`text-2xs ${KPI_TONE[kpi.tone] ?? "text-text-muted"}`}>{kpi.delta}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-lg border border-border bg-surface-strong/30 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text">Recent runs</p>
                  <Link href="/app/runs" className="text-2xs text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  {[
                    {
                      id: "run-safe-1001",
                      label: "safe-path-small-trade",
                      state: "Succeeded",
                      tone: "success"
                    },
                    {
                      id: "run-esc-1002",
                      label: "escalated-path-large-trade",
                      state: "Partial fill",
                      tone: "warning"
                    },
                    { id: "run-blk-1003", label: "denial-trace", state: "Denied", tone: "danger" }
                  ].map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 hover:border-border"
                    >
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-text">{row.id}</span>
                        <span className="text-2xs text-text-muted">{row.label}</span>
                      </div>
                      <Badge variant={row.tone as never} size="sm">
                        {row.state}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-surface-strong/30 p-4">
                <p className="text-sm font-medium text-text">Connector rail</p>
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  {[
                    { name: "Wallet RPC", tone: "warning", note: "Set WALLET_RPC_URL" },
                    { name: "Policy registry", tone: "success", note: "Synced 20m ago" },
                    { name: "ENS identity", tone: "success", note: "Synced 30m ago" },
                    { name: "KeeperHub", tone: "warning", note: "Set KEEPERHUB_API_KEY" },
                    { name: "Indexer", tone: "success", note: "Synced 5m ago" }
                  ].map((connector) => (
                    <li
                      key={connector.name}
                      className="flex items-center justify-between rounded-md px-2 py-1.5"
                    >
                      <span className="text-text">{connector.name}</span>
                      <Badge variant={connector.tone as never} size="sm">
                        {connector.note}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface/60 px-6 py-5">
          <div className="flex items-center gap-3">
            <Network className="size-5 text-primary" />
            <p className="max-w-md text-sm text-text-muted">
              Want a guided demo? Open the dashboard — every cell is wired to deterministic fallback data
              while connectors are configured.
            </p>
          </div>
          <Button asChild>
            <Link href="/app">
              Launch console <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border bg-surface/60">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-4 px-4 py-8 text-sm text-text-muted lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="text-text-muted">
              Policy-constrained autonomy · &copy; {new Date().getFullYear()} gctl
            </span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/app" className="hover:text-text">
              Console
            </Link>
            <Link href="/app/onboarding" className="hover:text-text">
              Readiness
            </Link>
            <Link href="/app/about" className="hover:text-text">
              About
            </Link>
            <Link
              href="https://github.com/0xgctl/gctl"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text"
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
