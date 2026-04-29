export type IndexedPolicy = {
  policyId: string;
  hash: string;
  uri: string;
  active: boolean;
  updatedAt: number;
};

export type IndexedWorkflow = {
  runId: string;
  workflowId: string;
  policyId: string;
  state: "succeeded" | "reverted" | "partial_fill" | "timed_out" | "cancelled" | "running" | "denied";
  auditPath: string;
  updatedAt: number;
  pathType?: "safe" | "escalated" | "blocked";
};

export type OpsOverview = {
  policyCount: number;
  activePolicies: number;
  workflowCount: number;
  failClosedAlerts: number;
  deterministicSuccessRate: number;
};

export type OnboardingCheck = {
  key: string;
  label: string;
  status: "ok" | "warn" | "bad";
  detail: string;
};

export type IdentityEvidence = {
  ensName: string;
  role: string;
  capabilities: string[];
  attestation: string;
  auditPath: string;
};

export type DisplayMode = "demo" | "live";
export type SessionView = "overview" | "investigation";

export type WorkspacePreferences = {
  displayMode: DisplayMode;
  sessionView: SessionView;
  indexerUrlReference: string;
};

export type OperatorSession = {
  operatorId: string;
  name: string;
  email: string;
  createdAt: number;
  lastSeenAt: number;
  preferences: WorkspacePreferences;
  pinnedRunIds: string[];
};

export type ConnectorHealth = "connected" | "degraded" | "disconnected";

export type ConnectorStatus = {
  key: "wallet" | "policyRegistry" | "ensIdentity" | "keeperhub" | "indexer";
  label: string;
  health: ConnectorHealth;
  detail: string;
  recoveryAction: string;
  lastSync: number | null;
};
