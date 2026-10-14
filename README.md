<div align="center">

# ⚡ ReconX
### Enterprise Payment Clearing & Multi-Pass Reconciliation Platform
**Engineered in .NET 8 · Clean Architecture · Next.js 14 · PostgreSQL 16 · Idempotency Engine**

[![.NET CI](https://img.shields.io/badge/.NET-8.0%20LTS-512BD4.svg?style=flat&logo=dotnet)](https://dotnet.microsoft.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20%2F%20Modular%20Monolith-success.svg)](#-system-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests: Passed](https://img.shields.io/badge/Tests-9%20Passed%20(100%25)-brightgreen.svg)](#-testing-strategy--verification)

</div>

---

## 📌 Executive Summary

**ReconX** is an enterprise-grade financial clearing and transaction reconciliation platform designed for fintechs, payment gateways, and banking aggregators. It automates the verification of internal transaction ledgers against external payment provider settlement statements (Midtrans, Xendit, Bank Central Asia, Mandiri), detects nominal and status discrepancies, eliminates double-settlement fraud, and equips finance operations teams with a full-lifecycle exception management queue.

### Core Engineering Invariants:
- **Zero Floating-Point Drift**: Financial calculations operate strictly on `decimal` (C#) and `NUMERIC(18, 4)` (PostgreSQL) with Banker's Rounding (`MidpointRounding.ToEven`).
- **Deterministic Multi-Pass Pipeline**: 5-pass matching algorithm that accounts for deterministic reference matches, bank MDR fee variances, and missing/orphan records.
- **Strict Idempotency Guard**: Mutation endpoints enforce `X-Idempotency-Key` headers, caching deterministic responses and preventing duplicate financial execution.
- **Four-Eyes Operational Auditability**: Unmatched transactions route to an exception workflow where status transitions are immutable and require mandatory resolution justification.
- **High-Throughput Stream Ingestion**: Bank settlement files are parsed via streaming readers with SHA-256 batch file deduplication.

---

## 🏛️ System Architecture

ReconX is structured as a **Modular Monolith** adhering to Domain-Driven Design (DDD) and Clean Architecture:

```
[ Bank Statements / PG CSVs ]          [ Internal Payment Services ]
               │                                      │
               │ SHA-256 Ingestion                    │ Transaction Capture
               ▼                                      ▼
+─────────────────────────────────────────────────────────────────────────────+
|                         RECONX CORE PLATFORM                                |
+─────────────────────────────────────────────────────────────────────────────+
|                                                                             |
|  +───────────────────────────────────────────────────────────────────────+  |
|  |                       PRESENTATION & API LAYER                        |  |
|  |   - REST Controllers (RFC 7807 ProblemDetails Error Specifications)   |  |
|  |   - IdempotencyMiddleware (X-Idempotency-Key Caching & Hash Guard)    |  |
|  |   - Swagger / OpenAPI 3.0 Documentation                               |  |
|  +───────────────────────────────────┬───────────────────────────────────+  |
|                                      │                                      |
|                                      ▼                                      |
|  +───────────────────────────────────────────────────────────────────────+  |
|  |                       APPLICATION CORE LAYER                          |  |
|  |   - Multi-Pass Reconciliation Engine (Deterministic + Fee Matching)   |  |
|  |   - Stream CsvHelper Ingestion Engine with Row-Level Quarantine       |  |
|  |   - Exception Case Management & Audit Trail Orchestrator              |  |
|  +───────────────────┬───────────────────────────────┬───────────────────+  |
|                      │                               │                      |
|                      ▼                               ▼                      |
|  +───────────────────────+       +───────────────────────────────────────+  |
|  |     DOMAIN LAYER      |       |         INFRASTRUCTURE LAYER          |  |
|  |   - Pure Entities     |       |   - AppDbContext (EF Core PostgreSQL) |  |
|  |   - Money ValueObject |       |   - In-Memory Fallback Engine         |  |
|  |   - MatchStatus Enums |       |   - Idempotency & Audit Repository    |  |
|  +───────────────────────+       +───────────────────────────────────────+  |
|                                                                             |
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │
                                       ▼
                       [ PostgreSQL 16 Relational Engine ]
```

---

## ⚙️ Multi-Pass Reconciliation Algorithm

The matching engine processes transactions through a multi-pass pipeline to minimize false discrepancies:

```
┌──────────────────────────────────────────────────────────────┐
│ PASS 1: Exact Match                                          │
│ Kriteria: Same ExternalRef + Same Currency + Exact Amount    │ ──▶ [ MATCHED (1) ]
└──────────────────────────────┬───────────────────────────────┘
                               │ (Sisa Unmatched)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ PASS 2: Fee Variance Match                                   │
│ Kriteria: Same Ref + Nominal diff <= Max Fee Tolerance       │ ──▶ [ MATCHED_WITH_FEE (2) ]
│ (Internal Amount == Provider Net + Fee Amount)               │
└──────────────────────────────┬───────────────────────────────┘
                               │ (Sisa Unmatched)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ PASS 3: Amount Mismatch Discrepancy                          │
│ Kriteria: Ref matches, but amount variance > tolerance       │ ──▶ [ AMOUNT_MISMATCH (3) ] ──▶ Exception Case
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ PASS 4 & 5: Missing / Duplicate Detection                    │
│ - Internal exists, Provider absent                           │ ──▶ [ MISSING_PROVIDER (5) ] ──▶ Exception Case
│ - Provider exists, Internal absent                           │ ──▶ [ MISSING_INTERNAL (4) ] ──▶ Exception Case
│ - Provider Trx ID / Ref appears >= 2x in same batch          │ ──▶ [ DUPLICATE (6) ]        ──▶ Exception Case
└──────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI/UX Design System (Anti-AI Slop)

The frontend interface is engineered in **Next.js 14**, **TypeScript**, and **Tailwind CSS**, designed according to data-dense financial workbench principles:
- **OLED Slate Dark Theme**: Minimal eye fatigue for finance operations (`#020617` background, `#0B1120` cards, `#1E293B` borders).
- **Split Side-by-Side Comparator**: View internal ledger side-by-side with external provider statement rows with real-time variance calculation.
- **Monospace Financial Typography**: Crisp font tracking (`font-mono`) ensuring multi-column number alignment across decimal points.
- **Audit-Compliant Exception Modal**: Mandatory operator identification and notes before adjusting financial discrepancies.
- **Synthetic Statement Ingestion**: Instant CSV drag-and-drop with pre-flight SHA-256 file deduplication and 1-click demo data generators.

---

## 📂 Repository Structure

```
reconx/
├── backend/
│   ├── ReconX.sln                          # Master Solution file
│   ├── src/
│   │   ├── ReconX.Domain/                  # Core entities, Money value object, domain rules
│   │   │   ├── Entities/                   # Provider, InternalTrx, ProviderTrx, ReconRun, ExceptionCase
│   │   │   ├── Enums/                      # MatchStatus, ExceptionSeverity, ResolutionType
│   │   │   ├── ValueObjects/               # Money (Banker's Rounding, ISO Currency validation)
│   │   │   └── Exceptions/                 # DomainException
│   │   │
│   │   ├── ReconX.Application/             # Use cases, interfaces, DTOs
│   │   │   ├── DTOs/                       # Transaction, Reconciliation, Exception, Import DTOs
│   │   │   ├── Interfaces/                 # IAppDbContext, IReconciliationEngine, ICsvStreamParser
│   │   │   └── Services/                   # ReconciliationEngine, CsvStreamParser
│   │   │
│   │   ├── ReconX.Infrastructure/          # Persistence, EF Core, Seeder
│   │   │   ├── Persistence/                # AppDbContext, PostgreSQL DDL mappings, DbInitializer
│   │   │   └── Services/                   # IdempotencyService
│   │   │
│   │   └── ReconX.Api/                     # REST API Controllers & Pipeline
│   │       ├── Controllers/                # Transactions, Reconciliation, Exceptions, Dashboard
│   │       ├── Middlewares/                # IdempotencyMiddleware, GlobalExceptionMiddleware
│   │       └── Program.cs                  # IoC container, CORS, Swagger setup
│   │
│   └── tests/
│       └── ReconX.UnitTests/               # Unit test suite (FluentAssertions, xUnit)
│
├── frontend/                               # Next.js 14 TypeScript Frontend
│   ├── src/
│   │   ├── app/                            # App Router (page.tsx, layout.tsx, globals.css)
│   │   ├── components/                     # Navbar, DashboardOverview, Workbench, Exceptions
│   │   └── lib/                            # Typed API client
│   └── package.json
│
├── sample-data/                            # Synthetic bank settlement CSV datasets
│   └── midtrans_settlement_sample.csv
│
├── docs/                                   # Architecture, Threat Model, ADRs
│   ├── architecture.md
│   ├── reconciliation-rules.md
│   ├── threat-model.md
│   └── adr/
│       ├── 0001-modular-monolith.md
│       ├── 0002-numeric-precision-and-bankers-rounding.md
│       └── 0003-idempotency-engine.md
│
├── docker-compose.yml                      # Containerized PostgreSQL 16
└── README.md
```

---

## 🔌 Core REST API Contracts

### 1. Execute Multi-Pass Reconciliation Run
```http
POST /api/v1/reconciliation/run
Content-Type: application/json
X-Idempotency-Key: RUN-20261014-001
```
```json
{
  "providerId": "prov-midtrans-001",
  "cutoffStart": "2026-10-14T00:00:00Z",
  "cutoffEnd": "2026-10-14T23:59:59Z",
  "feeTolerancePercentage": 0.05
}
```

### 2. Ingest Provider Settlement CSV
```http
POST /api/v1/imports/upload
Content-Type: multipart/form-data
X-Idempotency-Key: UPLOAD-20261014-001
```
*Form Data: `providerId` (string), `file` (CSV attachment)*

### 3. Resolve Exception Case (Four-Eyes Workflow)
```http
POST /api/v1/exceptions/{id}/resolve
Content-Type: application/json
X-Idempotency-Key: RES-20261014-001
```
```json
{
  "resolutionType": 1,
  "resolutionNotes": "Verified against manual bank statement PDF. Difference attributed to late-night cut-off batch.",
  "resolvedBy": "OPS-LEAD-01"
}
```

---

## 🧪 Testing Strategy & Verification

The solution features automated unit tests verifying financial invariants, precision bounds, and matching logic:

```bash
cd backend
dotnet test --logger "console;verbosity=normal"
```

### Test Suite Highlights:
- **`Money_ShouldApplyBankersRoundingToFourDecimals`**: Validates `MidpointRounding.ToEven` on fractional decimals.
- **`Money_ShouldThrowException_WhenOperatingBetweenDifferentCurrencies`**: Prohibits operating across mismatched currency codes (`IDR` vs `USD`).
- **`ExecuteRunAsync_ShouldMatchExactly_WhenReferenceAndGrossAmountAreEqual`**: Asserts deterministic 100% exact matching.
- **`ExecuteRunAsync_ShouldFlagAmountMismatch_AndCreateExceptionCase`**: Asserts automatic exception routing when variances exceed tolerance.
- **`ExecuteRunAsync_ShouldDetectMissingInProvider`**: Asserts detection of missing settlement records.
- **`ParseProviderCsvAsync_ShouldExtractValidRows_WhenCsvIsValid`**: Validates stream CSV parsing and row quarantine.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+ or 20+ LTS](https://nodejs.org/)
- [Docker & Docker Compose](https://www.docker.com/) (Optional: in-memory engine active by default)

### 1. Launch PostgreSQL (Optional)
```bash
docker compose up -d
```

### 2. Run Backend API (.NET 8)
```bash
cd backend/src/ReconX.Api
dotnet run
```
*API will start on `http://localhost:5000` with interactive Swagger UI at `http://localhost:5000/swagger`.*

### 3. Run Frontend Dashboard (Next.js 14)
```bash
cd frontend
npm install
npm run dev
```
*Dashboard will be accessible at `http://localhost:3000`.*

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
