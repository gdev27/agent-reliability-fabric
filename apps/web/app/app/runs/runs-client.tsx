"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownUp,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  PinIcon,
  Search,
  X
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../../components/page-header";
import { FallbackBanner } from "../../../components/fallback-banner";
import { EmptyState } from "../../../components/empty-state";
import { StatusPill } from "../../../components/status-pill";
import { CopyTextButton } from "../../../components/copy-text-button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Checkbox } from "../../../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../../../components/ui/dropdown-menu";
import { pinRunForSession } from "../../../lib/api";
import type { IndexedWorkflow } from "../../../lib/types";
import { statusLabel, statusReason } from "../../../lib/status";
import { RUN_FILTER_LABELS, RUN_PATH_LABELS } from "../../../lib/ui-constants";
import { cn } from "../../../lib/cn";

type RunState = IndexedWorkflow["state"];

type SortKey = "updatedAt" | "runId" | "workflowId" | "state";

const STATE_OPTIONS = (Object.keys(RUN_FILTER_LABELS) as Array<keyof typeof RUN_FILTER_LABELS>).filter(
  (key) => key !== "all"
) as RunState[];

const PATH_OPTIONS: Array<keyof typeof RUN_PATH_LABELS | "any"> = ["any", "safe", "escalated", "blocked"];

const PAGE_SIZE = 12;

function formatRelative(timestamp: number): string {
  const delta = Date.now() - timestamp;
  if (delta < 60_000) return "just now";
  const minutes = Math.round(delta / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

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
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [statusFilters, setStatusFilters] = useState<Set<RunState>>(() => {
    const status = searchParams.get("status");
    if (status && status !== "all" && (STATE_OPTIONS as readonly string[]).includes(status)) {
      return new Set([status as RunState]);
    }
    return new Set();
  });
  const [pathFilter, setPathFilter] = useState<keyof typeof RUN_PATH_LABELS | "any">(() => {
    const path = searchParams.get("path");
    if (path === "safe" || path === "escalated" || path === "blocked") return path;
    return "any";
  });
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
    key: "updatedAt",
    direction: "desc"
  });
  const [page, setPage] = useState(0);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(search), 200);
    return () => window.clearTimeout(handle);
  }, [search]);

  // Derived "page reset on filter change" via the documented `setState during render` pattern.
  // See: https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const filterSignature = `${debouncedSearch}|${Array.from(statusFilters).sort().join(",")}|${pathFilter}|${sort.key}:${sort.direction}`;
  const [previousSignature, setPreviousSignature] = useState(filterSignature);
  if (filterSignature !== previousSignature) {
    setPreviousSignature(filterSignature);
    setPage(0);
  }

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    if (statusFilters.size === 1) {
      const [first] = Array.from(statusFilters);
      if (first) params.set("status", first);
    } else {
      params.delete("status");
    }
    if (pathFilter !== "any") {
      params.set("path", pathFilter);
    } else {
      params.delete("path");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [debouncedSearch, statusFilters, pathFilter, pathname, router, searchParams]);

  const visibleRuns = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return runs
      .filter((run) => {
        if (statusFilters.size > 0 && !statusFilters.has(run.state)) {
          return false;
        }
        if (pathFilter !== "any" && run.pathType !== pathFilter) {
          return false;
        }
        if (term.length === 0) return true;
        return (
          run.runId.toLowerCase().includes(term) ||
          run.workflowId.toLowerCase().includes(term) ||
          run.policyId.toLowerCase().includes(term) ||
          run.auditPath.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const direction = sort.direction === "asc" ? 1 : -1;
        if (sort.key === "updatedAt") {
          return (a.updatedAt - b.updatedAt) * direction;
        }
        const aValue = a[sort.key] as string;
        const bValue = b[sort.key] as string;
        return aValue.localeCompare(bValue) * direction;
      });
  }, [runs, debouncedSearch, statusFilters, pathFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(visibleRuns.length / PAGE_SIZE));
  const pagedRuns = visibleRuns.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const failClosedCount = useMemo(
    () =>
      runs.filter((run) => run.state === "denied" || run.state === "timed_out" || run.state === "reverted")
        .length,
    [runs]
  );

  function toggleStatus(state: RunState) {
    setStatusFilters((current) => {
      const next = new Set(current);
      if (next.has(state)) {
        next.delete(state);
      } else {
        next.add(state);
      }
      return next;
    });
  }

  function clearFilters() {
    setStatusFilters(new Set());
    setPathFilter("any");
    setSearch("");
  }

  async function pinRun(runId: string) {
    const result = await pinRunForSession(runId);
    if (result.session) {
      toast.success(`Pinned ${runId}`, {
        description: "Available across sessions for this workspace."
      });
    } else {
      toast.message("Sign in to pin runs", {
        description: "Open Settings to create an operator session.",
        action: {
          label: "Settings",
          onClick: () => router.push("/app/settings")
        }
      });
    }
  }

  function toggleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "desc" }
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Run Center"
        title="Execution timeline and triage"
        description="Find risky outcomes quickly, understand why they occurred, and drill into evidence for each run."
        breadcrumbs={[{ href: "/app", label: "Console" }, { label: "Runs" }]}
        status={
          <Badge variant={failClosedCount > 0 ? "warning" : "success"}>{failClosedCount} fail-closed</Badge>
        }
        actions={
          <Button asChild variant="outline">
            <Link href="/app/onboarding">
              Readiness <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      {dataSource === "fallback" ? (
        <FallbackBanner message="Fallback data active: run records are currently rendered from deterministic snapshots instead of live execution feeds." />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside aria-label="Run filters" className="flex h-fit flex-col gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Filters</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="run-search"
                  className="text-2xs font-semibold uppercase tracking-wider text-text-muted"
                >
                  Search
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                  <Input
                    id="run-search"
                    placeholder="Run, workflow, policy"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="pl-9 pr-9"
                  />
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted hover:bg-surface-strong hover:text-text"
                      aria-label="Clear search"
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted">Status</p>
                <ul className="flex flex-col gap-1.5">
                  {STATE_OPTIONS.map((state) => (
                    <li key={state} className="flex items-center gap-2">
                      <Checkbox
                        id={`state-${state}`}
                        checked={statusFilters.has(state)}
                        onCheckedChange={() => toggleStatus(state)}
                      />
                      <label htmlFor={`state-${state}`} className="flex-1 cursor-pointer text-sm text-text">
                        {statusLabel(state)}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                  Execution path
                </p>
                <RadioGroup
                  value={pathFilter}
                  onValueChange={(value) => setPathFilter(value as typeof pathFilter)}
                >
                  {PATH_OPTIONS.map((option) => (
                    <div key={option} className="flex items-center gap-2">
                      <RadioGroupItem id={`path-${option}`} value={option} />
                      <label
                        htmlFor={`path-${option}`}
                        className="cursor-pointer text-sm capitalize text-text"
                      >
                        {option === "any" ? "Any" : RUN_PATH_LABELS[option]}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {statusFilters.size > 0 || pathFilter !== "any" || search ? (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="self-start">
                  Clear filters
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </aside>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between gap-2 border-b border-border">
            <div>
              <CardTitle className="text-sm">Runs</CardTitle>
              <p className="text-xs text-text-muted">
                {visibleRuns.length} matching {visibleRuns.length === 1 ? "run" : "runs"}
              </p>
            </div>
            {visibleRuns.length > 0 ? (
              <Badge variant="muted">
                Page {Math.min(page + 1, totalPages)} / {totalPages}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent className="p-0">
            {visibleRuns.length === 0 ? (
              <div className="px-6 py-10">
                <EmptyState
                  title="No runs match these filters"
                  description="Try clearing filters, or verify readiness and connector health before re-running."
                  ctaHref="/app/onboarding"
                  ctaLabel="Open readiness checks"
                  secondaryHref="/app/settings"
                  secondaryLabel="Check connectors"
                />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <SortableHeader label="Run" sortKey="runId" current={sort} onToggle={toggleSort} />
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          <SortableHeader
                            label="Workflow"
                            sortKey="workflowId"
                            current={sort}
                            onToggle={toggleSort}
                          />
                        </TableHead>
                        <TableHead>
                          <SortableHeader
                            label="State"
                            sortKey="state"
                            current={sort}
                            onToggle={toggleSort}
                          />
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">Path</TableHead>
                        <TableHead className="hidden xl:table-cell">
                          <SortableHeader
                            label="Updated"
                            sortKey="updatedAt"
                            current={sort}
                            onToggle={toggleSort}
                          />
                        </TableHead>
                        <TableHead className="text-right" aria-label="Row actions" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedRuns.map((run) => {
                        return (
                          <TableRow key={run.runId} className="group">
                            <TableCell>
                              <Link
                                href={`/app/runs/${encodeURIComponent(run.runId)}`}
                                className="font-mono text-xs text-text hover:underline"
                                aria-label={`Open ${run.runId}`}
                              >
                                {run.runId}
                              </Link>
                              <p className="mt-0.5 text-2xs text-text-muted md:hidden">{run.workflowId}</p>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-text-muted">
                              {run.workflowId}
                            </TableCell>
                            <TableCell>
                              <StatusPill state={run.state} />
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {run.pathType ? (
                                <Badge
                                  variant={
                                    run.pathType === "blocked"
                                      ? "danger"
                                      : run.pathType === "escalated"
                                        ? "warning"
                                        : "muted"
                                  }
                                >
                                  {RUN_PATH_LABELS[run.pathType]}
                                </Badge>
                              ) : (
                                <span className="text-2xs text-text-muted">Unclassified</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell text-2xs text-text-muted">
                              {formatRelative(run.updatedAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                                <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                                  <Link href={`/app/runs/${encodeURIComponent(run.runId)}`}>Open</Link>
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label={`Actions for ${run.runId}`}
                                    >
                                      <EllipsisVertical className="size-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onSelect={() => pinRun(run.runId)}>
                                      <PinIcon className="size-4" /> Pin run
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onSelect={() => {
                                        navigator.clipboard
                                          ?.writeText(run.runId)
                                          .then(() => toast.success("Run ID copied to clipboard"))
                                          .catch(() => undefined);
                                      }}
                                    >
                                      Copy run ID
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => router.push("/app/evidence")}>
                                      Open evidence
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 text-xs text-text-muted">
                  <p>
                    Showing {pagedRuns.length} of {visibleRuns.length} ·{" "}
                    {failClosedCount > 0 ? (
                      <span className="text-warn">{failClosedCount} need review</span>
                    ) : (
                      <span className="text-good">No fail-closed</span>
                    )}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={page === 0}
                      onClick={() => setPage((current) => Math.max(0, current - 1))}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={page + 1 >= totalPages}
                      onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                      aria-label="Next page"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {pagedRuns.some((run) => run.state === "denied" || run.state === "reverted") ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Review tip</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-text-muted">
            Denied runs include the policy reason inline. Reverted runs always carry an audit pointer — copy
            the run ID with{" "}
            <CopyTextButton value={pagedRuns[0]?.runId ?? ""} className={cn(!pagedRuns[0] && "hidden")} />
            <span className="ml-2">{statusReason("denied")}</span>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

function SortableHeader({
  label,
  sortKey,
  current,
  onToggle
}: {
  label: string;
  sortKey: SortKey;
  current: { key: SortKey; direction: "asc" | "desc" };
  onToggle: (key: SortKey) => void;
}) {
  const active = current.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onToggle(sortKey)}
      className={cn(
        "inline-flex items-center gap-1 rounded text-2xs uppercase tracking-wider transition-colors",
        active ? "text-text" : "text-text-muted hover:text-text"
      )}
    >
      {label}
      <ArrowDownUp className={cn("size-3", !active && "opacity-50")} />
    </button>
  );
}

export function RunsClient(props: { initialRuns: IndexedWorkflow[]; initialSource: "live" | "fallback" }) {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="py-8 text-sm text-text-muted">Loading run filters…</CardContent>
        </Card>
      }
    >
      <RunsClientInner {...props} />
    </Suspense>
  );
}
