# ADR 0001: Adoption of Modular Monolith Architecture

## Status
Accepted

## Context
Payment clearing and reconciliation requires strong transactional consistency across transaction ingestion, batch matching, and exception audit logs. A distributed microservices setup at inception introduces distributed transaction overhead (Saga / 2PC), increased deployment latency, and debugging complexity without immediate business justification.

## Decision
We adopted a **Modular Monolith** structure partitioned into distinct Clean Architecture layers:
- `ReconX.Domain`
- `ReconX.Application`
- `ReconX.Infrastructure`
- `ReconX.Api`

## Consequences
- **Positive**: Single-database atomic transactions (`IAppDbContext.SaveChangesAsync`), zero network serialization penalty between modules, straightforward local and automated CI test execution.
- **Negative**: Scalability is bounded by monolithic scaling until data volume warrants extracting background matching into dedicated worker daemons.
