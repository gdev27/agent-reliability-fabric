"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ListChecks, ShieldCheck, Sparkles, ZapOff } from "lucide-react";
import { PageHeader } from "../../../components/page-header";
import { FallbackBanner } from "../../../components/fallback-banner";
import { EmptyState } from "../../../components/empty-state";
import { CopyTextButton } from "../../../components/copy-text-button";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Slider } from "../../../components/ui/slider";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../../../components/ui/sheet";
import type { IndexedPolicy } from "../../../lib/types";
import { cn } from "../../../lib/cn";

const ASSETS = ["USDC", "DAI", "USDT", "ETH"];
const ESCALATION_THRESHOLD = 100_000;

export function PoliciesClient({
  initialPolicies,
  initialSource
}: {
  initialPolicies: IndexedPolicy[];
  initialSource: "live" | "fallback";
}) {
  const [policies] = useState<IndexedPolicy[]>(initialPolicies);
  const [dataSource] = useState<"live" | "fallback">(initialSource);
  const [amount, setAmount] = useState(10_000);
  const [asset, setAsset] = useState("USDC");
  const [search, setSearch] = useState("");
  const [drawerPolicy, setDrawerPolicy] = useState<IndexedPolicy | null>(null);

  const filteredPolicies = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return policies;
    return policies.filter(
      (policy) =>
        policy.policyId.toLowerCase().includes(term) ||
        policy.hash.toLowerCase().includes(term) ||
        policy.uri.toLowerCase().includes(term)
    );
  }, [policies, search]);

  const escalated = amount > ESCALATION_THRESHOLD;

  return (
    <>
      <PageHeader
        eyebrow="Policy control"
        title="Policy inventory and routing intent"
        description="Review active policy artifacts and preview how intent size affects safe versus escalated routing."
        breadcrumbs={[{ href: "/app", label: "Console" }, { label: "Policies" }]}
        status={
          <Badge variant={dataSource === "live" ? "info" : "warning"}>
            {dataSource === "live" ? "Live" : "Demo"}
          </Badge>
        }
      />

      {dataSource === "fallback" ? (
        <FallbackBanner message="Fallback data active: policy artifacts are displayed from deterministic snapshots while live data is unavailable." />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Intent routing preview</CardTitle>
          <CardDescription>
            Preview how an input amount maps to safe or escalated operating posture before reviewing live
            runs.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-5">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="policy-amount"
                  className="text-2xs font-semibold uppercase tracking-wider text-text-muted"
                >
                  Amount
                </label>
                <span className="font-mono text-sm text-text">
                  {amount.toLocaleString()} {asset}
                </span>
              </div>
              <Slider
                id="policy-amount"
                min={1_000}
                max={500_000}
                step={1_000}
                value={[amount]}
                onValueChange={(value) => setAmount(value[0] ?? amount)}
                aria-label="Routing amount"
              />
              <div className="flex justify-between text-2xs text-text-muted">
                <span>1k</span>
                <span className="text-warn">100k threshold</span>
                <span>500k</span>
              </div>
            </div>
            <div className="grid gap-2 sm:max-w-xs">
              <label className="text-2xs font-semibold uppercase tracking-wider text-text-muted">Asset</label>
              <Select value={asset} onValueChange={setAsset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  {ASSETS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3">
            <div
              className={cn(
                "rounded-xl border p-4 transition-colors",
                escalated ? "border-warn/40 bg-warn-soft/40" : "border-good/40 bg-good-soft/40"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant={escalated ? "warning" : "success"}>
                  {escalated ? "Escalated path" : "Safe path"}
                </Badge>
                <span className="text-2xs text-text-muted">advisory</span>
              </div>
              <p className="mt-2 text-sm text-text">
                {escalated
                  ? "Escalated path required: private routing and report step enabled."
                  : "Safe path selected: batch auction route with standard controls."}
              </p>
            </div>
            <div className="rounded-md border border-border bg-surface-strong/40 p-3 text-xs text-text-muted">
              <p>
                This panel is advisory only. Final allow/deny outcomes still come from the policy engine and
                indexed run evidence.
              </p>
              <Link
                href="/app/runs?view=investigation"
                className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
              >
                Open runs for real outcomes
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row flex-wrap items-end justify-between gap-3 border-b border-border">
          <div>
            <CardTitle>Registered policies</CardTitle>
            <CardDescription>
              {policies.length} {policies.length === 1 ? "policy" : "policies"} indexed · click for detail
            </CardDescription>
          </div>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter by id, hash, URI"
            className="w-full md:w-64"
            aria-label="Filter policies"
          />
        </CardHeader>
        <CardContent className="p-4">
          {filteredPolicies.length === 0 ? (
            <EmptyState
              title={policies.length === 0 ? "No policies indexed" : "No matches"}
              description={
                policies.length === 0
                  ? "Register policy artifacts to view integrity state and lifecycle status in this control plane."
                  : "Try a different search term, or clear the filter."
              }
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredPolicies.map((policy) => (
                <button
                  key={policy.policyId}
                  type="button"
                  onClick={() => setDrawerPolicy(policy)}
                  className={cn(
                    "group flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-4 text-left shadow-card transition-all",
                    "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-popover",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-md",
                          policy.active ? "bg-good-soft text-good" : "bg-warn-soft text-warn"
                        )}
                      >
                        {policy.active ? <ShieldCheck className="size-4" /> : <ZapOff className="size-4" />}
                      </span>
                      <Badge variant={policy.active ? "success" : "warning"} size="sm">
                        {policy.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <ArrowRight className="size-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-text">{policy.policyId}</p>
                    <p className="mt-1 truncate font-mono text-2xs text-text-muted" title={policy.hash}>
                      {policy.hash}
                    </p>
                  </div>
                  <p className="text-2xs text-text-muted">
                    Updated {new Date(policy.updatedAt).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={drawerPolicy !== null} onOpenChange={(open) => !open && setDrawerPolicy(null)}>
        <SheetContent side="right" className="w-full max-w-md gap-6">
          <SheetHeader>
            <SheetTitle>Policy detail</SheetTitle>
            <SheetDescription>
              Hash, URI, and lifecycle signals. Use these for integrity verification.
            </SheetDescription>
          </SheetHeader>
          {drawerPolicy ? (
            <div className="flex flex-col gap-4 text-sm">
              <DrawerField label="Policy ID" value={drawerPolicy.policyId} mono />
              <DrawerField label="Hash" value={drawerPolicy.hash} mono />
              <DrawerField label="URI" value={drawerPolicy.uri} mono />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-surface-strong/40 px-3 py-2">
                  <p className="text-2xs uppercase tracking-wider text-text-muted">Status</p>
                  <p className="mt-1 text-text">{drawerPolicy.active ? "Active" : "Inactive"}</p>
                </div>
                <div className="rounded-md border border-border bg-surface-strong/40 px-3 py-2">
                  <p className="text-2xs uppercase tracking-wider text-text-muted">Updated</p>
                  <p className="mt-1 text-text">{new Date(drawerPolicy.updatedAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/app/runs?policy=${encodeURIComponent(drawerPolicy.policyId)}`}>
                    <ListChecks className="size-4" /> Runs using this policy
                  </Link>
                </Button>
                <Button variant="ghost" onClick={() => setDrawerPolicy(null)}>
                  Close
                </Button>
              </div>
              <div className="rounded-md border border-info/40 bg-info-soft/40 p-3 text-xs text-info">
                <Sparkles className="mr-2 inline size-4" />
                Policy authoring lives in the registry contract. This pane is read-only.
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function DrawerField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted">{label}</p>
      <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-strong/40 px-3 py-2">
        <span className={cn("min-w-0 truncate text-text", mono && "font-mono text-xs")}>{value}</span>
        <CopyTextButton value={value} />
      </div>
    </div>
  );
}
