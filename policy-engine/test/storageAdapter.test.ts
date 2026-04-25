import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { compilePolicy } from "../src/compiler";
import { LocalFileAdapter } from "../src/storageAdapter";
import { Policy } from "../src/types";

const policy: Policy = {
  id: "policy-storage",
  version: "1.0.0",
  schema_version: "1.0.0",
  jurisdiction: "EU",
  regulation: "MiCA",
  assets: {
    base: "EURRWA",
    settle_tokens: ["EURC", "USDC"]
  },
  privacy: {
    large_trade_threshold: 100000,
    large_trade_route: "private-mempool"
  },
  routing: {
    routing_threshold: 100000,
    small_trade_route: "cowswap",
    large_trade_route: "flashbots",
    allowed_dexes: ["FLASHBOTS_ROUTER"]
  },
  limits: {
    max_trade_value: 500000,
    max_daily_notional: 150000,
    max_single_trade: 500000
  },
  reporting: {
    enabled: true,
    regulator_endpoint: "https://regulator.example/report",
    report_on: ["large_trades", "limits_breached"],
    fields: ["amount", "assetIn", "assetOut"]
  },
  controls: {
    kill_switch_enabled: false
  }
};

const tempDirs: string[] = [];

async function createAdapter(): Promise<LocalFileAdapter> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "policy-storage-"));
  tempDirs.push(dir);
  return new LocalFileAdapter(dir);
}

describe("LocalFileAdapter hardening", () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs.splice(0).map(async (dir) => {
        await fs.rm(dir, { recursive: true, force: true });
      })
    );
  });

  it("rejects path traversal policy ids", async () => {
    const adapter = await createAdapter();
    const graph = compilePolicy(policy);
    await expect(adapter.saveGraph("../../etc/passwd", graph)).rejects.toThrow("invalid_policy_id");
  });

  it("verifies graph hash when verifyHash option is set", async () => {
    const adapter = await createAdapter();
    const graph = compilePolicy(policy);
    const { hash } = await adapter.saveGraph("policy_storage", graph);

    await expect(adapter.loadGraph("policy_storage", { verifyHash: hash })).resolves.toBeTruthy();
    await expect(adapter.loadGraph("policy_storage", { verifyHash: "0xdeadbeef" })).rejects.toThrow("policy_hash_mismatch");
  });

  it("persists daily notional snapshots to disk", async () => {
    const adapter = await createAdapter();
    await adapter.writeDailyNotional("policy_storage", "2026-01-01", 42000);
    expect(await adapter.readDailyNotional("policy_storage", "2026-01-01")).toBe(42000);
    expect(await adapter.readDailyNotional("policy_storage", "2026-01-02")).toBeUndefined();
  });
});
