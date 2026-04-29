import {
  mockChecks,
  mockIdentityEvidence,
  mockOverview,
  mockPolicies,
  mockWorkflows,
  mockConnectors
} from "./mock-data";
import {
  ConnectorStatus,
  IdentityEvidence,
  IndexedPolicy,
  IndexedWorkflow,
  OnboardingCheck,
  OperatorSession,
  OpsOverview,
  WorkspacePreferences
} from "./types";
import type { ZodType } from "zod";
import {
  connectorStatusSchema,
  identityEvidenceSchema,
  indexedPolicySchema,
  indexedWorkflowSchema,
  onboardingCheckSchema,
  opsOverviewSchema,
  operatorSessionSchema
} from "./schemas";

export type DataSource = "live" | "fallback";
export type TrustStatus = "healthy" | "degraded" | "fallback";

export type DataResult<T> = {
  data: T;
  source: DataSource;
  trustStatus?: TrustStatus;
  reasonCode?: string;
  recoveryAction?: string;
};

type FetchJsonOptions = {
  signal?: AbortSignal;
};

function isDataResult<T>(payload: unknown): payload is DataResult<T> {
  return typeof payload === "object" && payload !== null && "data" in payload && "source" in payload;
}

function validatePayload<T>(payload: unknown, schema: ZodType<T>): T | null {
  const validated = schema.safeParse(payload);
  return validated.success ? validated.data : null;
}

async function fetchJson<T>(
  path: string,
  fallback: T,
  schema: ZodType<T>,
  options: FetchJsonOptions = {}
): Promise<DataResult<T>> {
  try {
    const requestInit: RequestInit = {
      cache: "no-store"
    };
    if (options.signal) {
      requestInit.signal = options.signal;
    }
    const res = await fetch(path, requestInit);
    if (!res.ok) {
      return { data: fallback, source: "fallback" };
    }
    const payload: unknown = await res.json();
    if (isDataResult<T>(payload)) {
      const validatedData = validatePayload(payload.data, schema);
      if (validatedData === null) {
        return { data: fallback, source: "fallback", reasonCode: "INVALID_RESPONSE_SHAPE" };
      }
      return { ...payload, data: validatedData } as DataResult<T>;
    }
    const validatedPayload = validatePayload(payload, schema);
    if (validatedPayload === null) {
      return { data: fallback, source: "fallback", reasonCode: "INVALID_RESPONSE_SHAPE" };
    }
    return { data: validatedPayload, source: "live" };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    return { data: fallback, source: "fallback" };
  }
}

export async function getOverview(options?: FetchJsonOptions): Promise<DataResult<OpsOverview>> {
  return fetchJson<OpsOverview>("/api/ops/overview", mockOverview, opsOverviewSchema, options);
}

export async function getPolicies(options?: FetchJsonOptions): Promise<DataResult<IndexedPolicy[]>> {
  return fetchJson<IndexedPolicy[]>("/api/ops/policies", mockPolicies, indexedPolicySchema.array(), options);
}

export async function getWorkflows(options?: FetchJsonOptions): Promise<DataResult<IndexedWorkflow[]>> {
  return fetchJson<IndexedWorkflow[]>(
    "/api/ops/workflows",
    mockWorkflows,
    indexedWorkflowSchema.array(),
    options
  );
}

export async function getOnboardingChecks(
  options?: FetchJsonOptions
): Promise<DataResult<OnboardingCheck[]>> {
  return fetchJson<OnboardingCheck[]>(
    "/api/ops/onboarding-checks",
    mockChecks,
    onboardingCheckSchema.array(),
    options
  );
}

export async function getIdentityEvidence(
  options?: FetchJsonOptions
): Promise<DataResult<IdentityEvidence[]>> {
  return fetchJson<IdentityEvidence[]>(
    "/api/ops/evidence",
    mockIdentityEvidence,
    identityEvidenceSchema.array(),
    options
  );
}

export async function getConnectors(options?: FetchJsonOptions): Promise<DataResult<ConnectorStatus[]>> {
  return fetchJson<ConnectorStatus[]>(
    "/api/ops/connectors",
    mockConnectors,
    connectorStatusSchema.array(),
    options
  );
}

export async function getOperatorSession(
  options?: FetchJsonOptions
): Promise<{ session: OperatorSession | null }> {
  const requestInit: RequestInit = {
    cache: "no-store"
  };
  if (options?.signal) {
    requestInit.signal = options.signal;
  }
  const res = await fetch("/api/account/session", requestInit);
  if (!res.ok) {
    return { session: null };
  }
  const payload = (await res.json()) as { session?: unknown };
  if (!payload.session) {
    return { session: null };
  }
  const parsed = operatorSessionSchema.safeParse(payload.session);
  return { session: parsed.success ? parsed.data : null };
}

export async function createOperatorSession(input: {
  name: string;
  email: string;
}): Promise<{ session: OperatorSession | null; message?: string }> {
  const res = await fetch("/api/account/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const payload = (await res.json()) as { session?: unknown; message?: string };
  if (!res.ok) {
    return { session: null, message: payload.message || "Unable to create session." };
  }
  const parsed = operatorSessionSchema.safeParse(payload.session);
  return { session: parsed.success ? parsed.data : null };
}

export async function deleteOperatorSession(): Promise<void> {
  await fetch("/api/account/session", { method: "DELETE" });
}

export async function updateWorkspacePreferences(
  preferences: Partial<WorkspacePreferences>
): Promise<{ session: OperatorSession | null }> {
  const res = await fetch("/api/account/workspace", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ preferences })
  });
  if (!res.ok) {
    return { session: null };
  }
  const payload = (await res.json()) as { session?: unknown };
  const parsed = operatorSessionSchema.safeParse(payload.session);
  return { session: parsed.success ? parsed.data : null };
}

export async function pinRunForSession(runId: string): Promise<{ session: OperatorSession | null }> {
  const res = await fetch("/api/account/pins", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ runId })
  });
  if (!res.ok) {
    return { session: null };
  }
  const payload = (await res.json()) as { session?: unknown };
  const parsed = operatorSessionSchema.safeParse(payload.session);
  return { session: parsed.success ? parsed.data : null };
}
