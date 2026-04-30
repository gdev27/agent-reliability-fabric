"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, Tags, X } from "lucide-react";
import { PageHeader } from "../../../components/page-header";
import { FallbackBanner } from "../../../components/fallback-banner";
import { EmptyState } from "../../../components/empty-state";
import { CopyTextButton } from "../../../components/copy-text-button";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Checkbox } from "../../../components/ui/checkbox";
import { Skeleton } from "../../../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { getIdentityEvidence } from "../../../lib/api";
import type { IdentityEvidence } from "../../../lib/types";

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<IdentityEvidence[]>([]);
  const [dataSource, setDataSource] = useState<"live" | "fallback">("live");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const result = await getIdentityEvidence({ signal: controller.signal });
        if (controller.signal.aborted) return;
        setEvidence(result.data);
        setDataSource(result.source);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  const roleOptions = useMemo(() => {
    const set = new Set<string>();
    evidence.forEach((row) => set.add(row.role));
    return Array.from(set).sort();
  }, [evidence]);

  const capabilityOptions = useMemo(() => {
    const set = new Set<string>();
    evidence.forEach((row) => row.capabilities.forEach((cap) => set.add(cap)));
    return Array.from(set).sort();
  }, [evidence]);

  const [selectedCapabilities, setSelectedCapabilities] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return evidence.filter((row) => {
      if (selectedRoles.size > 0 && !selectedRoles.has(row.role)) return false;
      if (selectedCapabilities.size > 0 && !row.capabilities.some((cap) => selectedCapabilities.has(cap))) {
        return false;
      }
      if (!term) return true;
      return (
        row.ensName.toLowerCase().includes(term) ||
        row.attestation.toLowerCase().includes(term) ||
        row.auditPath.toLowerCase().includes(term)
      );
    });
  }, [evidence, search, selectedRoles, selectedCapabilities]);

  function toggleRole(role: string) {
    setSelectedRoles((current) => {
      const next = new Set(current);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  }

  function toggleCapability(capability: string) {
    setSelectedCapabilities((current) => {
      const next = new Set(current);
      if (next.has(capability)) next.delete(capability);
      else next.add(capability);
      return next;
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Evidence"
        title="Identity and attestation evidence"
        description="Verify who acted, what was attested, and where audit artifacts are stored."
        breadcrumbs={[{ href: "/app", label: "Console" }, { label: "Evidence" }]}
        status={
          <Badge variant={dataSource === "live" ? "info" : "warning"}>
            {dataSource === "live" ? "Live" : "Demo"}
          </Badge>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Working from a run?</CardTitle>
          <CardDescription>
            Open the Run Center first to scope an investigation, then return here to validate identity and
            attestation metadata.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-text-muted">
          <Link href="/app/runs" className="text-primary hover:underline">
            Open Run Center
          </Link>
        </CardContent>
      </Card>

      {dataSource === "fallback" ? (
        <FallbackBanner message="Fallback data active: evidence rows are deterministic snapshots and must not be treated as live attestations." />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex h-fit flex-col gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Filters</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="evidence-search"
                  className="text-2xs font-semibold uppercase tracking-wider text-text-muted"
                >
                  Search
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                  <Input
                    id="evidence-search"
                    placeholder="ENS, attestation, path"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="pl-9 pr-9"
                  />
                  {search ? (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted hover:bg-surface-strong hover:text-text"
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>

              {roleOptions.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted">Roles</p>
                  <ul className="flex flex-col gap-1.5">
                    {roleOptions.map((role) => (
                      <li key={role} className="flex items-center gap-2">
                        <Checkbox
                          id={`role-${role}`}
                          checked={selectedRoles.has(role)}
                          onCheckedChange={() => toggleRole(role)}
                        />
                        <label
                          htmlFor={`role-${role}`}
                          className="cursor-pointer text-sm text-text capitalize"
                        >
                          {role}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {capabilityOptions.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                    Capabilities
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {capabilityOptions.map((capability) => {
                      const active = selectedCapabilities.has(capability);
                      return (
                        <li key={capability}>
                          <button
                            type="button"
                            onClick={() => toggleCapability(capability)}
                            className={`rounded-full border px-2.5 py-0.5 text-2xs ${
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border-strong bg-surface text-text-muted hover:bg-surface-strong"
                            }`}
                          >
                            {capability}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </aside>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-end justify-between gap-2 border-b border-border">
            <div>
              <CardTitle className="text-sm">Evidence records</CardTitle>
              <CardDescription>
                {filtered.length} of {evidence.length} records
              </CardDescription>
            </div>
            <Tags className="size-4 text-text-muted" />
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="grid gap-2 p-4">
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </div>
            ) : evidence.length === 0 ? (
              <div className="px-6 py-10">
                <EmptyState
                  icon={ShieldCheck}
                  title="No evidence records yet"
                  description="Evidence appears after runs write identity and attestation artifacts to indexed storage."
                />
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-10">
                <EmptyState
                  icon={ShieldCheck}
                  title="No matches"
                  description="Try clearing role or capability filters."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ENS</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden md:table-cell">Capabilities</TableHead>
                      <TableHead className="hidden lg:table-cell">Attestation</TableHead>
                      <TableHead className="hidden xl:table-cell">Audit path</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((row) => (
                      <TableRow key={row.ensName}>
                        <TableCell>
                          <Badge variant="muted" className="font-mono text-xs">
                            {row.ensName}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize text-text-muted">{row.role}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <ul className="flex flex-wrap gap-1.5">
                            {row.capabilities.map((capability) => (
                              <li key={capability}>
                                <Badge size="sm" variant="outline">
                                  {capability}
                                </Badge>
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-text">{row.attestation}</span>
                            <CopyTextButton value={row.attestation} />
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-text">{row.auditPath}</span>
                            <CopyTextButton value={row.auditPath} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
