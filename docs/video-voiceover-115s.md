# 115-Second Voiceover Script (Word-for-Word)

Use this as the spoken track while running commands from `docs/video-script.md`.

"This is gctl, a policy-first agent runtime that combines ENS identity, 0G reasoning traces, and KeeperHub execution routing.

First, I run `npm run ens:passport`.  
The output shows `ensName` is `gdev27.eth`, `authorized` is true, and reverse verification is true.  
It resolves wallet `0x0dd8516ad3a78D83fb5DD6a42AD8D4543BF1150E`, role `executor`, and capabilities for execution, policy routing, and reconciliation.  
The policy profile hash is also bound in metadata.

Next, I run `npm run demo:deterministic`.  
In the small branch, policy allows execution: route is public, DEX is COWSWAP, and path type is batch-auction.  
You can see 0G compute preflight, memory artifact URIs, and a chain attestation on chain ID 16602 with tx hash `0x104b179a7a33f2085c66807cdc257c0f342ea818178efd825be1d38bb15eabcc`.  
It then returns a KeeperHub workflow ID `uurl801haxjj3nzgak7a8`, run ID `dw5c5k3lug0blpsbh31s2`, and reconciliation state `timed_out`.

In the large branch, policy blocks execution fail-closed with reason `daily_notional_exceeded`, and the failing daily detail is `2225000`.

Then I run `npm run demo:swarm`.  
The swarm is allowed to reason over the objective to rebalance treasury into a compliant risk-adjusted position.  
Planner, researcher, and critic all return verified traces through the simulated 0G compute provider.  
But final execution is still policy-gated, and execution is denied with `daily_notional_exceeded`, with daily detail `2100000`.

So the outcome is clear: identity is verifiable, reasoning is traceable, execution is auditable, and policy enforcement is fail-closed by default.  
All of these outputs are reproducible from CLI and captured in the evidence artifacts in this repo."
