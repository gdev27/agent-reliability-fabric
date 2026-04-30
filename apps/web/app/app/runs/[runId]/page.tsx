import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  History,
  ScrollText,
  ShieldCheck
} from "lucide-react";
import { loadWorkflowById } from "../../../api/ops/_lib/data";
import { CopyTextButton } from "../../../../components/copy-text-button";
import { FallbackBanner } from "../../../../components/fallback-banner";
import { PageHeader } from "../../../../components/page-header";
import { StatusPill } from "../../../../components/status-pill";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { RunTimeline } from "../../../../components/runs/run-timeline";
import { statusReason } from "../../../../lib/status";
import { RUN_PATH_LABELS } from "../../../../lib/ui-constants";

export default async function RunDetailsPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  if (!/^[a-zA-Z0-9:_-]{3,128}$/.test(runId)) {
    notFound();
  }
  const workflowsResult = await loadWorkflowById(runId);
  const run = workflowsResult.data;

  if (!run) {
    notFound();
  }

  const isFailClosed = run.state === "denied" || run.state === "timed_out" || run.state === "reverted";

  return (
    <>
      <PageHeader
        eyebrow="Run detail"
        title={`Run ${run.runId}`}
        description="Review outcome, policy linkage, and evidence pointers before taking corrective action."
        breadcrumbs={[
          { href: "/app", label: "Console" },
          { href: "/app/runs", label: "Runs" },
          { label: run.runId }
        ]}
        status={<StatusPill state={run.state} size="lg" />}
        actions={
          <>
            <Button asChild variant="ghost">
              <Link href="/app/runs">
                <ArrowLeft className="size-4" /> Back to runs
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/app/evidence">Open evidence</Link>
            </Button>
            <Button asChild>
              <Link href="/app/settings">
                Connector health <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      {workflowsResult.source === "fallback" ? (
        <FallbackBanner message="Fallback data active: this run detail is rendered from deterministic snapshots because live run data was unavailable." />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Decision path</CardTitle>
            <CardDescription>
              Each step shows what the policy engine evaluated before allowing or blocking the action.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RunTimeline state={run.state} pathType={run.pathType} updatedAt={run.updatedAt} />
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-sm">Run identifiers</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Field label="Workflow" value={run.workflowId} copyable copyValue={run.workflowId} />
            <Field label="Policy" value={run.policyId} copyable copyValue={run.policyId} />
            <Field
              label="Execution path"
              value={run.pathType ? (RUN_PATH_LABELS[run.pathType] ?? "Unclassified") : "Unclassified"}
            />
            <div className="rounded-md border border-border bg-surface-strong/40 p-3">
              <p className="text-2xs uppercase tracking-wider text-text-muted">Status context</p>
              <p className="mt-1 text-sm text-text">{statusReason(run.state)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            <ClipboardList className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="evidence">
            <ShieldCheck className="size-4" />
            Evidence
          </TabsTrigger>
          <TabsTrigger value="logs">
            <ScrollText className="size-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="replay">
            <History className="size-4" />
            Replay
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Outcome summary</CardTitle>
              <CardDescription>
                Operator-readable explanation of what happened and what to do next.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-text-muted">
              <p>{statusReason(run.state)}</p>
              <ul className="grid gap-1.5">
                <li>
                  <span className="text-text">Workflow:</span> {run.workflowId}
                </li>
                <li>
                  <span className="text-text">Policy:</span> {run.policyId}
                </li>
                <li>
                  <span className="text-text">Last update:</span> {new Date(run.updatedAt).toLocaleString()}
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Evidence trail</CardTitle>
              <CardDescription>Audit pointer that links this run to its reconciliation log.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface-strong/40 p-3">
                <span className="font-mono text-xs text-text">{run.auditPath}</span>
                <CopyTextButton value={run.auditPath} label="Copy path" />
              </div>
              <p className="text-xs text-text-muted">
                For denied or timed-out outcomes, confirm readiness checks and policy limits before retrying.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Logs</CardTitle>
              <CardDescription>
                Indexer log streams will render here when log access is enabled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-72 overflow-auto rounded-md border border-border bg-surface-strong/40 p-4 font-mono text-xs text-text-muted">
                {`# audit pointer
${run.auditPath}

# policy
${run.policyId}

# state
${run.state} — ${statusReason(run.state)}`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="replay">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Replay</CardTitle>
              <CardDescription>
                Replay this run against the latest policy hash to validate corrections.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Button variant="outline" disabled>
                Replay against current policy
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/app/policies">View policy registry</Link>
              </Button>
              <Badge variant="muted">Replay UI ships in a follow-up</Badge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isFailClosed ? (
        <Card className="border-warn/40 bg-warn-soft/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-warn-soft text-warn">
                <CheckCircle2 className="size-5" />
              </span>
              <CardTitle>Fail-closed recovery steps</CardTitle>
            </div>
            <CardDescription>
              The policy engine intentionally blocked execution. Walk through these steps before retrying.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-text-muted">
              <li>Confirm readiness checks are healthy in the Readiness view.</li>
              <li>Validate policy limits and intent fields before re-running.</li>
              <li>Re-run only after evidence and policy references match expected values.</li>
            </ol>
            <div className="mt-4 flex gap-2">
              <Button asChild>
                <Link href="/app/onboarding">Open readiness checks</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/app/policies">Inspect policies</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

function Field({
  label,
  value,
  copyable,
  copyValue
}: {
  label: string;
  value: string;
  copyable?: boolean;
  copyValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted">{label}</p>
      <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-strong/40 px-3 py-2">
        <span className="truncate font-mono text-xs text-text">{value}</span>
        {copyable && copyValue ? <CopyTextButton value={copyValue} /> : null}
      </div>
    </div>
  );
}
