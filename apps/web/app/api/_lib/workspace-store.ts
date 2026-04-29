import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { OperatorSession, WorkspacePreferences } from "../../../lib/types";
import { defaultPreferences } from "../../../lib/workspace";

const STORE_DIR = path.join(process.cwd(), ".runtime");
const STORE_PATH = path.join(STORE_DIR, "workspace-store.json");

type WorkspaceStore = {
  sessions: Record<string, OperatorSession>;
};

function createDefaultStore(): WorkspaceStore {
  return { sessions: {} };
}

async function readStore(): Promise<WorkspaceStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as WorkspaceStore;
    return parsed?.sessions ? parsed : createDefaultStore();
  } catch {
    return createDefaultStore();
  }
}

async function writeStore(store: WorkspaceStore): Promise<void> {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

function sanitizePreferences(
  preferences: Partial<WorkspacePreferences> | undefined,
  current: WorkspacePreferences
): WorkspacePreferences {
  return {
    displayMode: preferences?.displayMode === "live" ? "live" : current.displayMode,
    sessionView: preferences?.sessionView === "investigation" ? "investigation" : current.sessionView,
    indexerUrlReference:
      typeof preferences?.indexerUrlReference === "string" &&
      preferences.indexerUrlReference.trim().length > 0
        ? preferences.indexerUrlReference.trim()
        : current.indexerUrlReference
  };
}

export async function createSession(input: { name: string; email: string }): Promise<OperatorSession> {
  const now = Date.now();
  const session: OperatorSession = {
    operatorId: randomUUID(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    createdAt: now,
    lastSeenAt: now,
    preferences: defaultPreferences(),
    pinnedRunIds: []
  };
  const store = await readStore();
  store.sessions[session.operatorId] = session;
  await writeStore(store);
  return session;
}

export async function getSession(operatorId: string): Promise<OperatorSession | null> {
  const store = await readStore();
  const session = store.sessions[operatorId];
  if (!session) {
    return null;
  }
  const updated: OperatorSession = {
    ...session,
    lastSeenAt: Date.now()
  };
  store.sessions[operatorId] = updated;
  await writeStore(store);
  return updated;
}

export async function clearSession(operatorId: string): Promise<void> {
  const store = await readStore();
  if (store.sessions[operatorId]) {
    delete store.sessions[operatorId];
    await writeStore(store);
  }
}

export async function updateSessionPreferences(
  operatorId: string,
  preferences: Partial<WorkspacePreferences>
): Promise<OperatorSession | null> {
  const store = await readStore();
  const session = store.sessions[operatorId];
  if (!session) {
    return null;
  }
  const updated: OperatorSession = {
    ...session,
    lastSeenAt: Date.now(),
    preferences: sanitizePreferences(preferences, session.preferences)
  };
  store.sessions[operatorId] = updated;
  await writeStore(store);
  return updated;
}

export async function pinRun(operatorId: string, runId: string): Promise<OperatorSession | null> {
  const store = await readStore();
  const session = store.sessions[operatorId];
  if (!session) {
    return null;
  }
  const alreadyPinned = session.pinnedRunIds.includes(runId);
  const updated: OperatorSession = {
    ...session,
    lastSeenAt: Date.now(),
    pinnedRunIds: alreadyPinned ? session.pinnedRunIds : [runId, ...session.pinnedRunIds].slice(0, 8)
  };
  store.sessions[operatorId] = updated;
  await writeStore(store);
  return updated;
}
