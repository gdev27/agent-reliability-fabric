# Deployment Addresses

Use this as a final fill-in sheet before submission.

## Completion status
- [x] Base Sepolia deployment complete
- [x] 0G attestation target recorded
- [x] Explorer deep links added
- [x] Deployment tx hashes added
- [x] `.env` updated with final addresses

## Networks
- ENS read network: Ethereum mainnet
- Policy registry network: Base Sepolia (`84532`)
- 0G chain attestation target: 0G Testnet (`16602`)

## Contracts
- `PolicyRegistry`: `0x9eaB6ef0Cdd26363f0608DD0908adcf1BC0a4814`
- `ExecutionAttestation` (if separated from registry): `n/a (chain attestation currently uses adapter receipt path)`
- Optional ERC-8004 registry: `n/a (not configured in this workspace)`

## Deployment transactions
- Base Sepolia deploy tx hash (`PolicyRegistry`): `0x5c431661680dbf7c3ae26a3b5c88b8b5bb3570a0bdd333257fa712669c5bc540`
- 0G attestation tx hash (if applicable): `n/a (simulated chain adapter in current run)`
- Deployment start block (`POLICY_REGISTRY_START_BLOCK`): `40818159`

## Explorer links
- Base Sepolia explorer: https://sepolia.basescan.org
- 0G testnet explorer: https://chainscan-galileo.0g.ai
- `PolicyRegistry` address link: `https://sepolia.basescan.org/address/0x9eaB6ef0Cdd26363f0608DD0908adcf1BC0a4814`
- `PolicyRegistry` tx link: `https://sepolia.basescan.org/tx/0x5c431661680dbf7c3ae26a3b5c88b8b5bb3570a0bdd333257fa712669c5bc540`
- 0G attestation link (if used): `n/a in current run`

## `.env` mappings
- `POLICY_REGISTRY_ADDRESS=0x9eaB6ef0Cdd26363f0608DD0908adcf1BC0a4814`
- `ERC8004_REGISTRY_ADDRESS=`
- `POLICY_REGISTRY_CHAIN_ID=84532`
- `POLICY_REGISTRY_START_BLOCK=40818159`

## Policy URI requirements
- `PolicyMeta.uri` resolves to immutable content-addressed artifacts.
- For local development this may be `file://...` or `og://stub/...`.
- For production, replace stub URIs with CID-backed identifiers (or an equivalent tamper-evident URI scheme).

## Demo ENS names
- Fund ENS: `vitalik.eth`
- Executor ENS: `vitalik.eth`
- Role ENS (swarm): `vitalik.eth`, `vitalik.eth`, `vitalik.eth`, `vitalik.eth`

## Dry-run notes
- `npm run demo:deterministic` and `npm run demo:swarm` pass in deterministic mode.
- `npm run test` and `npm run typecheck` pass on current branch.
- If RPC values are missing, system returns fail-closed denies with explicit error codes.
- Final pre-submission: rerun both demos with live settings and verify links in this file are public.
