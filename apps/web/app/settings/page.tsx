"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createOperatorSession,
  deleteOperatorSession,
  getConnectors,
  getOperatorSession,
  updateWorkspacePreferences
} from "../../lib/api";
import { PageHeader } from "../../components/page-header";
import { ConnectorStatus, DisplayMode, OperatorSession, SessionView } from "../../lib/types";
import { defaultPreferences, DEFAULT_INDEXER_REFERENCE } from "../../lib/workspace";

const INDEXER_KEY = "gctl.settings.indexerUrl";
const MODE_KEY = "gctl.settings.mode";
const SESSION_VIEW_KEY = "gctl.session.viewMode";
const SETTINGS_UPDATED_EVENT = "gctl:settings-updated";

export default function SettingsPage() {
  const [indexerUrl, setIndexerUrl] = useState(() => {
    if (typeof window === "undefined") {
      return DEFAULT_INDEXER_REFERENCE;
    }
    return window.localStorage.getItem(INDEXER_KEY) || DEFAULT_INDEXER_REFERENCE;
  });
  const [mode, setMode] = useState<DisplayMode>(() => {
    if (typeof window === "undefined") {
      return "demo";
    }
    return window.localStorage.getItem(MODE_KEY) === "live" ? "live" : "demo";
  });
  const [sessionView, setSessionView] = useState<SessionView>(() => {
    if (typeof window === "undefined") {
      return "overview";
    }
    return window.localStorage.getItem(SESSION_VIEW_KEY) === "investigation" ? "investigation" : "overview";
  });
  const [saveMessage, setSaveMessage] = useState("");
  const [connectors, setConnectors] = useState<ConnectorStatus[]>([]);
  const [session, setSession] = useState<OperatorSession | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      const [sessionResult, connectorResult] = await Promise.all([
        getOperatorSession({ signal: controller.signal }),
        getConnectors({ signal: controller.signal })
      ]);
      if (controller.signal.aborted) {
        return;
      }
      if (sessionResult.session) {
        const preferences = sessionResult.session.preferences;
        setSession(sessionResult.session);
        setIndexerUrl(preferences.indexerUrlReference);
        setMode(preferences.displayMode);
        setSessionView(preferences.sessionView);
      }
      setConnectors(connectorResult.data);
    })();

    return () => controller.abort();
  }, []);

  async function saveSettings() {
    if (!indexerUrl.startsWith("http://") && !indexerUrl.startsWith("https://")) {
      setSaveMessage("Please enter a valid URL starting with http:// or https://");
      return;
    }
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
        setSaveMessage("Preferences saved to your account and this browser.");
      } else {
        setSaveMessage("Saved locally, but account sync failed. Re-authenticate and retry.");
      }
    } else {
      setSaveMessage("Preferences saved for this browser profile.");
    }
    window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
  }

  async function createSession() {
    const result = await createOperatorSession({ name, email });
    if (!result.session) {
      setAuthMessage(result.message || "Unable to create operator session.");
      return;
    }
    setSession(result.session);
    setMode(result.session.preferences.displayMode);
    setSessionView(result.session.preferences.sessionView);
    setIndexerUrl(result.session.preferences.indexerUrlReference);
    setAuthMessage("Operator session created. Workspace preferences now sync across sessions.");
  }

  async function signOut() {
    await deleteOperatorSession();
    setSession(null);
    setAuthMessage("Signed out. Local preferences remain available in this browser.");
  }

  const connectorSummary = useMemo(() => {
    const connected = connectors.filter((connector) => connector.health === "connected").length;
    const degraded = connectors.filter((connector) => connector.health === "degraded").length;
    const disconnected = connectors.filter((connector) => connector.health === "disconnected").length;
    return { connected, degraded, disconnected };
  }, [connectors]);

  return (
    <section className="page">
      <PageHeader
        eyebrow="Settings"
        title="Operator session and connection center"
        description="Sign in to save workspace state, set operator preferences, and verify connector health before running operations."
      />

      <div className="grid grid-2">
        <article className="card">
          <h3>Operator account</h3>
          {session ? (
            <>
              <p className="muted">
                Signed in as <strong>{session.name}</strong> ({session.email})
              </p>
              <p className="muted">Pinned runs saved: {session.pinnedRunIds.length}</p>
              <button type="button" className="btn" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <label htmlFor="operatorName" className="field">
                <span className="field-label">Display name</span>
                <input
                  id="operatorName"
                  className="input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label htmlFor="operatorEmail" className="field">
                <span className="field-label">Work email</span>
                <input
                  id="operatorEmail"
                  type="email"
                  className="input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <button type="button" className="btn btn-primary" onClick={createSession}>
                Create account session
              </button>
              <p className="muted mb-0">
                Session-backed preferences allow saved work and continuity across devices.
              </p>
            </>
          )}
          {authMessage ? <p className="muted mt-2 mb-0">{authMessage}</p> : null}
        </article>

        <article className="card">
          <h3>Workspace preferences</h3>
          <label htmlFor="indexerUrl" className="field">
            <span className="field-label">URL</span>
            <input
              className="input mono"
              id="indexerUrl"
              value={indexerUrl}
              onChange={(event) => setIndexerUrl(event.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">Display mode</span>
            <select
              className="select"
              value={mode}
              onChange={(event) => setMode(event.target.value as DisplayMode)}
            >
              <option value="demo">Demo-safe wording</option>
              <option value="live">Live-data wording</option>
            </select>
          </label>
          <label className="field">
            <span className="field-label">View density</span>
            <select
              className="select"
              value={sessionView}
              onChange={(event) => setSessionView(event.target.value as SessionView)}
            >
              <option value="overview">Overview (simple summaries)</option>
              <option value="investigation">Investigation (more detail)</option>
            </select>
          </label>
          <p className="muted mb-0">
            These settings now drive visible behavior across Dashboard and Run Center.
          </p>
        </article>

        <article className="card full-width">
          <div className="row-between">
            <h3>Connections</h3>
            <span className="pill neutral">
              {connectorSummary.connected} connected / {connectorSummary.degraded} degraded /{" "}
              {connectorSummary.disconnected} disconnected
            </span>
          </div>
          <div className="grid">
            {connectors.map((connector) => (
              <article key={connector.key} className="card card-tight">
                <div className="row-between">
                  <p className="mb-0">
                    <strong>{connector.label}</strong>
                  </p>
                  <span
                    className={`pill ${
                      connector.health === "connected"
                        ? "ok"
                        : connector.health === "degraded"
                          ? "warn"
                          : "bad"
                    }`}
                  >
                    {connector.health}
                  </span>
                </div>
                <p className="muted">{connector.detail}</p>
                <p className="mb-0 muted">
                  Recovery action: {connector.recoveryAction}
                  {connector.lastSync ? ` Last sync: ${new Date(connector.lastSync).toLocaleString()}.` : ""}
                </p>
              </article>
            ))}
          </div>
        </article>

        <article className="card full-width">
          <h3>Trust envelope contract</h3>
          <p className="muted">
            Live, degraded, and fallback states are rendered with explicit disclosures so demo snapshots are
            never mistaken for production telemetry.
          </p>
          <p className="mb-0">
            Changing preferences never bypasses policy checks or alters backend permissions.
          </p>
        </article>
      </div>

      <div className="row mt-1">
        <button type="button" onClick={saveSettings} className="btn btn-primary">
          Save settings
        </button>
        {saveMessage ? (
          <span className="muted" aria-live="polite">
            {saveMessage}
          </span>
        ) : null}
      </div>
    </section>
  );
}
