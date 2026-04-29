import { KeeperHubWorkflow } from "./buildFromPlan";

export type WorkflowTerminalState = "succeeded" | "reverted" | "partial_fill" | "timed_out" | "cancelled" | "running";

export interface KeeperHubClient {
  createWorkflow(workflow: KeeperHubWorkflow): Promise<{ workflowId: string }>;
  runWorkflow(workflowId: string): Promise<{ runId: string }>;
  getWorkflowStatus(runId: string): Promise<{ state: WorkflowTerminalState; raw: unknown }>;
  getExecutionLogs?(runId: string): Promise<{ events: Array<Record<string, unknown>> }>;
  getAnalytics?(): Promise<{
    successRate?: number;
    avgExecutionTimeMs?: number;
    failedRuns?: number;
    totalGasUsedWei?: string;
  }>;
}

export class HttpKeeperHubClient implements KeeperHubClient {
  constructor(private readonly apiUrl: string, private readonly apiKey: string) {}

  private normalizeState(status: string | undefined): WorkflowTerminalState {
    switch ((status || "").toLowerCase()) {
      case "success":
      case "succeeded":
        return "succeeded";
      case "error":
      case "failed":
      case "reverted":
        return "reverted";
      case "cancelled":
        return "cancelled";
      case "partial_fill":
        return "partial_fill";
      case "timed_out":
      case "timeout":
        return "timed_out";
      case "pending":
      case "running":
      default:
        return "running";
    }
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.apiUrl}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
        ...(init.headers || {})
      }
    });
    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      const errorHint = errorBody ? ` body=${errorBody.slice(0, 240).replace(/\s+/g, " ")}` : "";
      throw new Error(`KeeperHub request failed: ${response.status} ${response.statusText}${errorHint}`);
    }
    const payload = (await response.json()) as T | { data?: T };
    if (payload && typeof payload === "object" && "data" in payload) {
      return (payload as { data?: T }).data as T;
    }
    return payload as T;
  }

  async createWorkflow(workflow: KeeperHubWorkflow): Promise<{ workflowId: string }> {
    const nodes = [
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 80, y: 100 },
        data: {
          label: "Manual Trigger",
          type: "manual"
        }
      },
      ...workflow.steps.map((step, index) => ({
        id: `action-${index + 1}`,
        type: "action",
        position: { x: 360, y: 100 + index * 140 },
        data: {
          label: step.type,
          type: step.type,
          params: step.params
        }
      }))
    ];
    const edges = workflow.steps.map((_step, index) => ({
      id: `edge-${index}`,
      source: index === 0 ? "trigger-1" : `action-${index}`,
      target: `action-${index + 1}`
    }));

    const created = await this.request<
      | { workflowId?: string; id?: string }
      | { workflow?: { id?: string }; id?: string; workflowId?: string }
    >("/workflows/create", {
      method: "POST",
      body: JSON.stringify({
        name: workflow.name,
        description: `gctl policyId=${String(workflow.metadata?.policyId || "")} route=${String(
          workflow.metadata?.route || ""
        )}`,
        nodes,
        edges
      })
    });
    const workflowId =
      (created as { workflowId?: string }).workflowId ||
      (created as { id?: string }).id ||
      (created as { workflow?: { id?: string } }).workflow?.id;
    if (!workflowId) {
      throw new Error("KeeperHub createWorkflow response missing workflow id");
    }
    return { workflowId };
  }

  async runWorkflow(workflowId: string): Promise<{ runId: string }> {
    const execution = await this.request<{ runId?: string; executionId?: string; id?: string; status?: string }>(
      `/workflow/${workflowId}/execute`,
      {
      method: "POST"
    });
    const runId = execution.runId || execution.executionId || execution.id;
    if (!runId) {
      throw new Error("KeeperHub execute response missing run id");
    }
    return { runId };
  }

  async getWorkflowStatus(runId: string): Promise<{ state: WorkflowTerminalState; raw: unknown }> {
    const status = await this.request<{ status?: string; state?: string; nodeStatuses?: unknown[]; progress?: unknown }>(
      `/workflows/executions/${runId}/status`,
      { method: "GET" }
    );
    return {
      state: this.normalizeState(status.status || status.state),
      raw: status
    };
  }

  async getExecutionLogs(runId: string): Promise<{ events: Array<Record<string, unknown>> }> {
    const steps = await this.request<{ steps?: Array<Record<string, unknown>>; events?: Array<Record<string, unknown>> }>(
      `/analytics/runs/${runId}/steps`,
      { method: "GET" }
    );
    return { events: steps.events || steps.steps || [] };
  }

  async getAnalytics(): Promise<{
    successRate?: number;
    avgExecutionTimeMs?: number;
    failedRuns?: number;
    totalGasUsedWei?: string;
  }> {
    const summary = await this.request<
      | {
          successRate?: number;
          avgExecutionTimeMs?: number;
          failedRuns?: number;
          totalGasUsedWei?: string;
        }
      | {
          totals?: { successRate?: number; failedRuns?: number; totalGasUsedWei?: string };
          performance?: { avgExecutionTimeMs?: number };
        }
    >(`/analytics/summary`, { method: "GET" });

    if ("totals" in summary || "performance" in summary) {
      const typed = summary as {
        totals?: { successRate?: number; failedRuns?: number; totalGasUsedWei?: string };
        performance?: { avgExecutionTimeMs?: number };
      };
      return {
        successRate: typed.totals?.successRate,
        failedRuns: typed.totals?.failedRuns,
        totalGasUsedWei: typed.totals?.totalGasUsedWei,
        avgExecutionTimeMs: typed.performance?.avgExecutionTimeMs
      };
    }

    return summary as {
      successRate?: number;
      avgExecutionTimeMs?: number;
      failedRuns?: number;
      totalGasUsedWei?: string;
    };
  }
}
