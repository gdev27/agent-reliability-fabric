# Security Model

## Contract controls
- `PolicyRegistry` uses:
  - `DEFAULT_ADMIN_ROLE`
  - `POLICY_ADMIN_ROLE`
  - `GUARDIAN_ROLE`
- `pause()` by guardian; `unpause()` by admin.
- This pause/unpause asymmetry is intentional: guardian can halt quickly in emergencies, while only admin can resume after incident review.
- Unauthorized policy mutation attempts revert.

## Fail-closed guarantees
`PolicyClient` denies planning (`allowed=false`) when any critical dependency fails:
- ENS lookup or malformed text records.
- Agent authorization missing.
- Registry read failure / inactive policy.
- Policy graph load timeout or hash mismatch.

## Key management
- Agent signer mode is env-injected for MVP (`AGENT_PRIVATE_KEY`).
- Versioned signer metadata tracks active key version.
- Rotation SOP:
  1. Provision new key.
  2. Update `AGENT_PRIVATE_KEY` + `AGENT_KEY_VERSION`.
  3. Verify signer health checks.
  4. Revoke old key in ops vault.

## Audit privacy
- Field classification:
  - `public`: plaintext
  - `restricted`: SHA-256 hash
  - `secret`: AES-GCM encrypted
- No plaintext persistence for sensitive execution payload fields.

## Policy artifact integrity
- Policy graphs are hash-verified at load time and again before policy evaluation.
- `PolicyRegistry` policy mutations emit previous and new hashes with a monotonic version counter for auditor traceability.
- For the OG-backed adapter path, `PolicyMeta.uri` must converge to a verifiable content address (CID or equivalent immutable digest address), not a mutable location prefix.
