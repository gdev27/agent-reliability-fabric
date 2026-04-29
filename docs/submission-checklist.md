# Submission Checklist

## Core Open Agents requirements
- [x] Project name + short description finalized.
- [x] Public GitHub repo link added.
- [x] README includes setup, architecture, and demo commands.
- [x] Working technical demo completed with live credentials (`demo:deterministic`, `demo:swarm`, and `ens:passport`).
- [ ] Demo video is 2-3 minutes and shows agentic reasoning.
- [x] Team member names + contact links (Telegram + X) added.

## Mandatory evidence to include
- [x] Deployed contract addresses listed (`docs/deployments.md`).
- [x] Triple-verified explanation included (`docs/triple-verified.md`).
- [x] Demo output JSON captured for safe, escalated, and blocked paths.
- [x] Swarm execution output captured with role traces.

## 0G track checklist
- [x] Show 0G Compute usage in planner/critic loops.
- [x] Show 0G Storage memory artifacts in demo output.
- [ ] Show 0G Chain attestation evidence and tx hash mapping.
- [x] Include one framework example and one autonomous swarm example.

## ENS track checklist
- [x] Show ENS identity passport output (`npm run ens:passport`).
- [x] Show role/subname identities and metadata fields.
- [x] Show authorization and reverse-verification in runtime flow.
- [x] Confirm no hard-coded values in final demo path.

## KeeperHub track checklist
- [x] Explain KeeperHub usage and why it is integral (not optional).
- [x] Show workflow submission, run status, logs, and analytics evidence.
- [x] Include encrypted audit artifact examples in repo or demo output.
- [x] Submit actionable integration feedback (`KEEPERHUB_FEEDBACK.md`).

## Final dry-run checklist (24h before deadline)
- [ ] Fresh clone setup test succeeds.
- [ ] `npm run judge:preflight` passes.
- [ ] `docs/evidence/judge-preflight-report.md` captured and reviewed.
- [ ] Video narration matches live outputs.
- [ ] Submission form links are valid and public.

## Automated trust gates
- [x] Trust invariants documented: `docs/trust-invariants.md`
- [x] Structured trust evidence exists: `docs/evidence/trust-evidence.json`
- [x] Evidence schema validation wired: `npm run validate:evidence`
- [x] Env contract validation wired: `npm run validate:env`
- [x] Submission trust claims covered by tests: `test/submissionTrustClaims.test.ts`

## Owner + evidence mapping (fill as completed)
- [x] Core demo owner: `Gaurav Dev`
- [x] ENS evidence owner: `Gaurav Dev`
- [x] 0G evidence owner: `Gaurav Dev`
- [x] KeeperHub evidence owner: `Gaurav Dev`
- [ ] Video owner: `Gaurav Dev`

## Verification snapshot (replace before submit)
- Date/time (UTC): `2026-04-29T21:17:18Z`
- Commit SHA: `298f70a32be7e2a8980a8ecfb874c7725ebfc3d7`
- Environment: `Windows 10 (local workspace)`
- `npm install`: `PASS`
- `npm run hh:compile`: `PASS`
- `npm run test`: `PASS`
- `npm run typecheck`: `PASS`
- `npm run compile:policy`: `FAIL (execution reverted: policy_exists on PolicyRegistry)`
- `npm run demo:init`: `FAIL (execution reverted: policy_exists on PolicyRegistry)`
- `npm run demo:deterministic`: `PASS (small path executes with KeeperHub workflow/run + succeeded reconciliation; large path policy-denied on daily_notional_exceeded)`
- `npm run demo:swarm`: `PASS (reverse verification succeeds; swarm execution path returns KeeperHub workflow/run + succeeded reconciliation)`
- `npm run ens:passport`: `PASS (passport generated on gdev27.eth; authorized=true, walletAddress resolved, and verifiedReverse=true)`
