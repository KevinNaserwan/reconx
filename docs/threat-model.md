# 🛡️ ReconX Threat Model & Security Posture (STRIDE)

In financial systems, integrity and auditability are non-negotiable. This document analyzes the security controls implemented in ReconX using the **STRIDE** methodology.

---

## 1. Threat Analysis & Mitigations

### A. Spoofing (Identity & Origin)
- **Threat**: Malicious actors forging settlement files or replaying operator actions.
- **Mitigation**:
  - SHA-256 fingerprinting on uploaded statement files (`UQ_import_file_hash`).
  - Immutable audit logs capturing `ActorUsername` and IP address for every mutation.

### B. Tampering (Data Modification)
- **Threat**: Alteration of settled amounts, transaction status, or variance calculations.
- **Mitigation**:
  - Database schema enforces relational constraints (`ON DELETE RESTRICT` for providers).
  - Four-Eyes Principle: operators cannot silently change exception statuses; mandatory resolution notes are enforced and recorded in `audit_logs`.
  - Exact decimal storage using `numeric(18, 4)`.

### C. Repudiation (Denial of Action)
- **Threat**: Operator denying manual match or force write-off authorization.
- **Mitigation**:
  - `audit_logs` table has no `UPDATE` or `DELETE` endpoints exposed.
  - Snapshots of `PreviousState` and `NewState` stored as JSON payloads.

### D. Information Disclosure
- **Threat**: Leakage of PII (card numbers, customer bank credentials).
- **Mitigation**:
  - Strict data minimization: ReconX only processes transaction references, channels, currencies, and settlement figures. No raw PAN or account passwords enter the system.

### E. Denial of Service (DoS & Resource Exhaustion)
- **Threat**: Uploading multi-gigabyte CSV settlement files causing memory exhaustion (OOM).
- **Mitigation**:
  - Memory-safe stream processing (`CsvReader` with `IAsyncEnumerable<T>`) avoids loading whole files into heap memory.

### F. Elevation of Privilege
- **Threat**: Regular operators performing unilateral financial write-offs.
- **Mitigation**:
  - Domain validation ensures `ResolutionType.ForceWriteOff` checks are auditable.
