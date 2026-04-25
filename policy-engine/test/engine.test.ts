import { describe, expect, it, beforeEach } from "vitest";
import { compilePolicy } from "../src/compiler";
import { evaluatePolicy, InMemoryDailyNotionalStore } from "../src/engine";
import { Policy } from "../src/types";

const policy: Policy = {
  id: "eurofund-mica",
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

describe("evaluatePolicy", () => {
  let notionalStore: InMemoryDailyNotionalStore;

  beforeEach(() => {
    notionalStore = new InMemoryDailyNotionalStore();
  });

  it("allows a small trade through public batch auction", async () => {
    const graph = compilePolicy(policy);
    const plan = await evaluatePolicy(
      graph,
      {
        actionType: "swap",
        assetIn: "EURC",
        assetOut: "EURRWA",
        amount: 10000
      },
      notionalStore
    );
    expect(plan.allowed).toBe(true);
    expect(plan.pathType).toBe("batch-auction");
    expect(plan.route).toBe("public");
    expect(plan.shouldReport).toBe(false);
  });

  it("routes a large trade to private path with reporting", async () => {
    const graph = compilePolicy(policy);
    const plan = await evaluatePolicy(
      graph,
      {
        actionType: "swap",
        assetIn: "USDC",
        assetOut: "EURRWA",
        amount: 120000
      },
      notionalStore
    );
    expect(plan.allowed).toBe(true);
    expect(plan.pathType).toBe("direct-swap");
    expect(plan.route).toBe("private-mempool");
    expect(plan.shouldReport).toBe(true);
  });

  it("denies non-whitelisted assets", async () => {
    const graph = compilePolicy(policy);
    const plan = await evaluatePolicy(
      graph,
      {
        actionType: "swap",
        assetIn: "WETH",
        assetOut: "EURRWA",
        amount: 1000
      },
      notionalStore
    );
    expect(plan.allowed).toBe(false);
    expect(plan.reason).toBe("asset_not_whitelisted");
  });

  it("allows daily notional exactly at limit", async () => {
    const graph = compilePolicy(policy);
    const plan = await evaluatePolicy(
      graph,
      {
        actionType: "swap",
        assetIn: "EURC",
        assetOut: "EURRWA",
        amount: 150000,
        timestamp: "2026-01-01T00:00:00.000Z"
      },
      notionalStore
    );
    expect(plan.allowed).toBe(true);
  });

  it("denies when daily notional is one unit over the limit", async () => {
    const graph = compilePolicy(policy);
    await evaluatePolicy(
      graph,
      {
        actionType: "swap",
        assetIn: "EURC",
        assetOut: "EURRWA",
        amount: 150000,
        timestamp: "2026-01-01T00:00:00.000Z"
      },
      notionalStore
    );
    const plan = await evaluatePolicy(
      graph,
      {
        actionType: "swap",
        assetIn: "EURC",
        assetOut: "EURRWA",
        amount: 1,
        timestamp: "2026-01-01T01:00:00.000Z"
      },
      notionalStore
    );
    expect(plan.allowed).toBe(false);
    expect(plan.reason).toBe("daily_notional_exceeded");
  });

  it("resets notional naturally on day rollover", async () => {
    const graph = compilePolicy(policy);
    await evaluatePolicy(
      graph,
      {
        actionType: "swap",
        assetIn: "EURC",
        assetOut: "EURRWA",
        amount: 150000,
        timestamp: "2026-01-01T23:59:59.000Z"
      },
      notionalStore
    );
    const nextDayPlan = await evaluatePolicy(
      graph,
      {
        actionType: "swap",
        assetIn: "EURC",
        assetOut: "EURRWA",
        amount: 1000,
        timestamp: "2026-01-02T00:00:00.000Z"
      },
      notionalStore
    );
    expect(nextDayPlan.allowed).toBe(true);
  });

  it("denies all actions when kill switch is active", async () => {
    const killSwitchPolicy: Policy = {
      ...policy,
      controls: {
        kill_switch_enabled: true
      }
    };
    const graph = compilePolicy(killSwitchPolicy);
    const plan = await evaluatePolicy(
      graph,
      {
        actionType: "swap",
        assetIn: "EURC",
        assetOut: "EURRWA",
        amount: 1000
      },
      notionalStore
    );
    expect(plan.allowed).toBe(false);
    expect(plan.reason).toBe("kill_switch_active");
  });

  it("does not bleed daily notional across store instances", async () => {
    const graph = compilePolicy(policy);
    const storeA = new InMemoryDailyNotionalStore();
    await evaluatePolicy(
      graph,
      {
        actionType: "swap",
        assetIn: "EURC",
        assetOut: "EURRWA",
        amount: 150000,
        timestamp: "2026-01-01T00:00:00.000Z"
      },
      storeA
    );

    const storeB = new InMemoryDailyNotionalStore();
    const planWithFreshStore = await evaluatePolicy(
      graph,
      {
        actionType: "swap",
        assetIn: "EURC",
        assetOut: "EURRWA",
        amount: 1000,
        timestamp: "2026-01-01T01:00:00.000Z"
      },
      storeB
    );

    expect(planWithFreshStore.allowed).toBe(true);
  });
});
