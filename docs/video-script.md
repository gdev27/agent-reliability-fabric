# 2-Minute Video Run-of-Show (Exact Current Outputs)

Last verified against local runtime on 2026-04-29 by running:

```bash
npm run ens:passport
npm run demo:deterministic
npm run demo:swarm
```

## Target runtime
- 2 minutes total.

## Recording prep
1. Open terminal at repo root.
2. Keep `docs/evidence/` ready in file explorer/editor for final shot.
3. Copy/paste each command below during recording.

## Run-of-show script

### 0:00-0:10 - Intro
**On screen:** repo root in terminal  
**Narration:**  
"This is gctl: a policy-first agent runtime with ENS identity, 0G reasoning traces, and KeeperHub execution routing."

### 0:10-0:35 - ENS identity proof
**Command:**
```bash
npm run ens:passport
```

**On-screen fields to point at:**
- `"ensName": "gdev27.eth"`
- `"authorized": true`
- `"walletAddress": "0x0dd8516ad3a78D83fb5DD6a42AD8D4543BF1150E"`
- `"verifiedReverse": true`
- `"role": "executor"`
- `"capabilities": ["execution","policy-routing","reconciliation"]`
- `"agent-policy-profile": "0x784465e5240990461301aeaae5c627480543bd04b1835d780dc7df22ff7d7dfc"`

**Narration:**  
"Identity resolves from ENS and reverse verification passes. The executor role and policy profile are bound in the passport."

### 0:35-1:20 - Deterministic policy branches
**Command:**
```bash
npm run demo:deterministic
```

**Point at `small` branch first:**
- `"allowed": true`
- `"route": "public"`
- `"dex": "COWSWAP"`
- `"pathType": "batch-auction"`
- `"computePreflight.provider": "0g-compute-simulated"`
- `"memoryArtifacts.preflight.uri": "og://local/..."`
- `"chainAttestation.chainId": 16602`
- `"chainAttestation.txHash": "0x104b179a7a33f2085c66807cdc257c0f342ea818178efd825be1d38bb15eabcc"`
- `"workflowId": "uurl801haxjj3nzgak7a8"`
- `"runId": "dw5c5k3lug0blpsbh31s2"`
- `"reconciliationState": "timed_out"`

**Then point at `large` branch:**
- `"allowed": false`
- `"reason": "daily_notional_exceeded"`
- daily check failure detail shows `"detail": "2225000"`

**Narration:**  
"For compliant size, execution is routed and traced end-to-end. For oversized daily notional, policy blocks execution fail-closed."

### 1:20-1:52 - Swarm traces plus guarded execution
**Command:**
```bash
npm run demo:swarm
```

**On-screen fields to point at:**
- `"allowed": true`
- objective: `"Rebalance treasury into compliant risk-adjusted position"`
- `traces.planner.provider = "0g-compute-simulated"`
- `traces.researcher.provider = "0g-compute-simulated"`
- `traces.critic.provider = "0g-compute-simulated"`
- `"execution.plan.allowed": false`
- `"execution.plan.reason": "daily_notional_exceeded"`
- daily check failure detail shows `"detail": "2100000"`

**Narration:**  
"Planner, researcher, and critic all emit traceable outputs. Even then, final execution stays policy-gated and is denied when limits are exceeded."

### 1:52-2:00 - Close
**On screen:** `docs/evidence/` files  
**Narration:**  
"All outputs are reproducible from CLI and stored as evidence artifacts. gctl is identity-anchored, traceable, and fail-closed by default."

## Also included
- Word-for-word voiceover version: `docs/video-voiceover-115s.md`
