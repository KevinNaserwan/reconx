# 🏛️ ReconX System Architecture & Design

ReconX is built upon a **Modular Monolith** architecture adhering to **Clean Architecture** and **Domain-Driven Design (DDD)** principles.

---

## 1. High-Level System Architecture

```
                       [ Payment Providers & Bank Reports ]
                                      |
                                      | CSV Ingestion (SHA-256 Deduplication)
                                      v
+-----------------------------------------------------------------------------------+
|                         RECONX CORE SYSTEM (Modular Monolith)                     |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                             PRESENTATION LAYER                              |  |
|  |   - REST Controllers (RFC 7807 ProblemDetails)                              |  |
|  |   - IdempotencyMiddleware (X-Idempotency-Key validation & caching)          |  |
|  |   - Swagger / OpenAPI Documentation                                         |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|                                        v                                          |
|  +-----------------------------------------------------------------------------+  |
|  |                             APPLICATION LAYER                               |  |
|  |   - ReconciliationEngine (Multi-Pass Matching Pipeline)                     |  |
|  |   - CsvStreamParser (Streaming CsvHelper with Row Quarantine)               |  |
|  |   - ExceptionService (Operator Assignment & Resolution Workflow)            |  |
|  |   - IdempotencyService                                                      |  |
|  +-------------------+---------------------------------+-----------------------+  |
|                      |                                 |                          |
|                      v                                 v                          |
|  +-----------------------+         +-------------------------------------------+  |
|  |     DOMAIN LAYER      |         |           INFRASTRUCTURE LAYER            |  |
|  |   - Entities          |         |   - AppDbContext (EF Core Npgsql Provider)|  |
|  |   - Money (Value Obj) |         |   - PostgreSQL Schema (NUMERIC 18, 4)     |  |
|  |   - MatchStatus Enums |         |   - In-Memory Fallback DB Engine          |  |
|  |   - Invariant Rules   |         |   - Immutable AuditLog Store              |  |
|  +-----------------------+         +-------------------------------------------+  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
                         [ PostgreSQL 16 Relational Store ]
```

---

## 2. Layer Separation & Responsibilities

1. **ReconX.Domain**:
   - Zero external framework dependencies.
   - Encapsulates pure business entities (`InternalTransaction`, `ProviderTransaction`, `ReconciliationRun`, `ExceptionCase`).
   - Implements `Money` value object with Banker's Rounding (`MidpointRounding.ToEven`) and currency invariants.

2. **ReconX.Application**:
   - Implements orchestration use-cases and service contracts.
   - Encapsulates the multi-pass reconciliation algorithm (`ReconciliationEngine`).
   - Handles memory-safe stream parsing (`CsvStreamParser`).

3. **ReconX.Infrastructure**:
   - Relational persistence mapping using Entity Framework Core 8.
   - Strict column types: `numeric(18, 4)` to eliminate floating-point drift.
   - SHA-256 batch file deduplication.

4. **ReconX.Api**:
   - Exposes REST endpoints conforming to RESTful standards.
   - Integrates `IdempotencyMiddleware` using HTTP header `X-Idempotency-Key`.
   - Global exception handling returning RFC 7807 `ProblemDetails`.
