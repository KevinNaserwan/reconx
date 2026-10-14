# ADR 0003: Idempotency Key Engine for Financial Mutation Operations

## Status
Accepted

## Context
Network timeouts, mobile retry loops, and client retries can cause identical financial mutation requests (e.g., triggering reconciliation runs, uploading statements, manual adjustment) to be executed multiple times, potentially creating duplicate ledger records.

## Decision
We implemented an HTTP middleware enforcing `X-Idempotency-Key`:
1. Checks table `idempotency_records` for prior completion with matching SHA-256 payload hash.
2. If already processed, immediately short-circuits and replays the cached HTTP response (`200 OK`) with header `X-Cache-Lookup: HIT-IDEMPOTENT`.
3. If new, executes the operation and caches the response status code and body for 24 hours.

## Consequences
- **Positive**: Guaranteed at-most-once processing semantics for financial mutations.
- **Negative**: Requires client to supply a unique UUID in request headers for state-changing endpoints.
