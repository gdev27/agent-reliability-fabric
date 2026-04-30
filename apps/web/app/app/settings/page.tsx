"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleDot,
  Cog,
  ExternalLink,
  Loader2,
  ShieldCheck,
  User,
  Workflow
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../../components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import {
  createOperatorSession,
  deleteOperatorSession,
  getConnectors,
  getOperatorSession,
  updateWorkspacePreferences
} from "../../../lib/api";
import type { ConnectorStatus, DisplayMode, OperatorSession, SessionView } from "../../../lib/types";
import { DEFAULT_INDEXER_REFERENCE } from "../../../lib/workspace";
import { cn } from "../../../lib/cn";

const INDEXER_KEY = "gctl.settings.indexerUrl";
const MODE_KEY = "gctl.settings.mode";
const SESSION_VIEW_KEY = "gctl.session.viewMode";
const SETTINGS_UPDATED_EVENT = "gctl:settings-updated";

const HEALTH_TONE: Record<
  ConnectorStatus["health"],
  { dot: string; tone: "success" | "warning" | "danger" }
> = {
  connected: { dot: "text-good", tone: "success" },
  degraded: { dot: "text-warn", tone: "warning" },
  disconnected: { dot: "text-bad", tone: "danger" }
};

function formatRelative(timestamp: number | null): string {
  if (!timestamp) return "Never";
  const delta = Date.now() - timestamp;
  if (delta < 60_000) return "just now";
  const minutes = Math.round(delta / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function SettingsPage() {
  const [indexerUrl, setIndexerUrl] = useState(DEFAULT_INDEXER_REFERENCE);
  const [mode, setMode] = useState<DisplayMode>("demo");
  const [sessionView, setSessionView] = useState<SessionView>("overview");
  const [connectors, setConnectors] = useState<ConnectorStatus[]>([]);
  const [session, setSession] = useState<OperatorSession | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [testingConnector, setTestingConnector] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Hydrate persisted preferences after mount (storage isn't available on the server).
    /* eslint-disable react-hooks/set-state-in-effect */
    setIndexerUrl(window.localStorage.getItem(INDEXER_KEY) || DEFAULT_INDEXER_REFERENCE);
    setMode(window.localStorage.getItem(MODE_KEY) === "live" ? "live" : "demo");
    setSessionView(
      window.localStorage.getItem(SESSION_VIEW_KEY) === "investigation" ? "investigation" : "overview"
    );
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      const [sessionResult, connectorResult] = await Promise.all([
        getOperatorSession({ signal: controller.signal }),
        getConnectors({ signal: controller.signal })
      ]);
      if (controller.signal.aborted) return;
      if (sessionResult.session) {
        setSession(sessionResult.session);
        setIndexerUrl(sessionResult.session.preferences.indexerUrlReference);
        setMode(sessionResult.session.preferences.displayMode);
        setSessionView(sessionResult.session.preferences.sessionView);
      }
      setConnectors(connectorResult.data);
    })();
    return () => controller.abort();
  }, []);

  const summary = useMemo(() => {
    const connected = connectors.filter((connector) => connector.health === "connected").length;
    const degraded = connectors.filter((connector) => connector.health === "degraded").length;
    const disconnected = connectors.filter((connector) => connector.health === "disconnected").length;
    return { connected, degraded, disconnected };
  }, [connectors]);

  async function savePreferences() {
    if (!indexerUrl.startsWith("http://") && !indexerUrl.startsWith("https://")) {
      toast.error("Invalid URL", {
        description: "Please enter a valid URL starting with http:// or https://"
      });
      return;
    }
    setSavingPreferences(true);
    window.localStorage.setItem(INDEXER_KEY, indexerUrl);
    window.localStorage.setItem(MODE_KEY, mode);
    window.localStorage.setItem(SESSION_VIEW_KEY, sessionView);
    if (session) {
      const updated = await updateWorkspacePreferences({
        displayMode: mode,
        sessionView,
        indexerUrlReference: indexerUrl
      });
      if (updated.session) {
        setSession(updated.session);
        toast.success("Preferences saved", {
          description: "Synced to your account and this browser."
        });
      } else {
        toast.error("Saved locally only", {
          description: "Account sync failed. Re-authenticate and retry."
        });
      }
    } else {
      toast.success("Preferences saved", {
        description: "Stored for this browser profile."
      });
    }
    window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
    setSavingPreferences(false);
  }

  async function createSession() {
    if (!name || !email) {
      toast.error("Name and email required");
      return;
    }
    setSigningIn(true);
    const result = await createOperatorSession({ name, email });
    setSigningIn(false);
    if (!result.session) {
      toast.error("Unable to create operator session", {
        description: result.message || "Try again or check your connection."
      });
      return;
    }
    setSession(result.session);
    setMode(result.session.preferences.displayMode);
    setSessionView(result.session.preferences.sessionView);
    setIndexerUrl(result.session.preferences.indexerUrlReference);
    toast.success("Operator session created", {
      description: "Workspace preferences will sync across sessions."
    });
  }

  async function signOut() {
    await deleteOperatorSession();
    setSession(null);
    toast.message("Signed out", {
      description: "Local preferences remain available in this browser."
    });
  }

  async function testConnector(key: ConnectorStatus["key"]) {
    setTestingConnector(key);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const fresh = await getConnectors();
    setConnectors(fresh.data);
    const found = fresh.data.find((connector) => connector.key === key);
    setTestingConnector(null);
    if (!found) {
      toast.error("Connector not found");
      return;
    }
    if (found.health === "connected") {
      toast.success(`${found.label} healthy`, {
        description: `Last sync ${formatRelative(found.lastSync)}.`
      });
    } else if (found.health === "degraded") {
      toast.warning(`${found.label} degraded`, {
        description: found.recoveryAction
      });
    } else {
      toast.error(`${found.label} disconnected`, {
        description: found.recoveryAction
      });
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Operator session and connection center"
        description="Sign in to save workspace state, set operator preferences, and verify connector health before running operations."
        breadcrumbs={[{ href: "/app", label: "Console" }, { label: "Settings" }]}
        status={
          <Badge variant="muted">
            {summary.connected}/{connectors.length} connected
          </Badge>
        }
      />

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">
            <User className="size-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="workspace">
            <Cog className="size-4" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="connections">
            <Workflow className="size-4" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="trust">
            <ShieldCheck className="size-4" />
            Trust
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Operator account</CardTitle>
              <CardDescription>
                Session-backed preferences allow saved work and continuity across devices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session ? (
                <div className="flex flex-col gap-4">
                  <div className="rounded-md border border-border bg-surface-strong/40 p-4 text-sm">
                    <p className="text-text">
                      Signed in as <span className="font-semibold">{session.name}</span>
                    </p>
                    <p className="text-text-muted">{session.email}</p>
                    <p className="mt-1 text-2xs text-text-muted">
                      Pinned runs saved: {session.pinnedRunIds.length}
                    </p>
                  </div>
                  <Button variant="outline" onClick={signOut}>
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label htmlFor="operator-name" className="flex flex-col gap-1.5">
                    <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                      Display name
                    </span>
                    <Input
                      id="operator-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Alicia"
                    />
                  </label>
                  <label htmlFor="operator-email" className="flex flex-col gap-1.5">
                    <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                      Work email
                    </span>
                    <Input
                      id="operator-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="alicia@example.com"
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <Button onClick={createSession} disabled={signingIn}>
                      {signingIn ? <Loader2 className="size-4 animate-spin" /> : null}
                      Create account session
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspace">
          <Card>
            <CardHeader>
              <CardTitle>Workspace preferences</CardTitle>
              <CardDescription>
                These settings drive visible behavior across Dashboard and Run Center.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <label htmlFor="indexer-url" className="flex flex-col gap-1.5">
                <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                  Indexer URL reference
                </span>
                <Input
                  id="indexer-url"
                  className="font-mono"
                  value={indexerUrl}
                  onChange={(event) => setIndexerUrl(event.target.value)}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                    Display mode
                  </span>
                  <Select value={mode} onValueChange={(value) => setMode(value as DisplayMode)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo">Demo-safe wording</SelectItem>
                      <SelectItem value="live">Live-data wording</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                    View density
                  </span>
                  <Select value={sessionView} onValueChange={(value) => setSessionView(value as SessionView)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Overview (simple summaries)</SelectItem>
                      <SelectItem value="investigation">Investigation (more detail)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-surface-strong/40 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-text">Investigation drawer</p>
                  <p className="text-2xs text-text-muted">
                    Reveal denser detail in run rows when investigation view is active.
                  </p>
                </div>
                <Switch
                  checked={sessionView === "investigation"}
                  onCheckedChange={(checked) => setSessionView(checked ? "investigation" : "overview")}
                  aria-label="Toggle investigation density"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={savePreferences} disabled={savingPreferences}>
                  {savingPreferences ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle>Connections</CardTitle>
              <CardDescription>
                {summary.connected} connected · {summary.degraded} degraded · {summary.disconnected}{" "}
                disconnected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2">
                {connectors.map((connector) => {
                  const tone = HEALTH_TONE[connector.health];
                  const isTesting = testingConnector === connector.key;
                  return (
                    <li
                      key={connector.key}
                      className="flex flex-col gap-3 rounded-lg border border-border bg-surface-strong/40 p-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <CircleDot className={cn("mt-1 size-4 shrink-0", tone.dot)} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-text">{connector.label}</p>
                            <Badge variant={tone.tone} size="sm">
                              {connector.health}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-text-muted">{connector.detail}</p>
                          <p className="mt-1 text-2xs text-text-muted">
                            Recovery: {connector.recoveryAction}
                          </p>
                          {connector.lastSync ? (
                            <p className="text-2xs text-text-muted">
                              Last sync {formatRelative(connector.lastSync)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnector(connector.key)}
                          disabled={isTesting}
                        >
                          {isTesting ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-4" />
                          )}
                          Test connection
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trust">
          <Card>
            <CardHeader>
              <CardTitle>Trust envelope contract</CardTitle>
              <CardDescription>
                Live, degraded, and fallback states are rendered with explicit disclosures so demo snapshots
                are never mistaken for production telemetry.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-text-muted">
              <p>
                Changing preferences never bypasses policy checks or alters backend permissions. Trust state
                is rendered uniformly across Dashboard, Run Center, and Evidence.
              </p>
              <ul className="grid gap-2 sm:grid-cols-3">
                <TrustChip label="source" detail="`live` or `fallback`" />
                <TrustChip label="trustStatus" detail="`healthy`, `degraded`, `fallback`" />
                <TrustChip label="recoveryAction" detail="Operator action text" />
              </ul>
              <a
                href="/docs/frontend-product-contract.md"
                className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
                rel="noopener"
                target="_blank"
              >
                Read the frontend product contract
                <ExternalLink className="size-3.5" />
              </a>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function TrustChip({ label, detail }: { label: string; detail: string }) {
  return (
    <li className="rounded-md border border-border bg-surface-strong/40 px-3 py-2 text-text">
      <span className="font-mono text-xs">{label}</span>
      <p className="mt-0.5 text-2xs text-text-muted">{detail}</p>
    </li>
  );
}
