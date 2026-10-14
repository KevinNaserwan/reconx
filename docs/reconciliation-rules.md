# ⚙️ Multi-Pass Reconciliation Rules & Logic

The ReconX matching engine executes a 5-pass deterministic algorithm to correlate internal ledger transactions with external settlement records.

---

## 1. Multi-Pass Matching Flow

```
[ Internal Transactions ]       [ Provider Settlement Rows ]
           │                                 │
           └────────────────┬────────────────┘
                            ▼
     ┌──────────────────────────────────────────────┐
     │ PASS 1: Deterministic Exact Match            │
     │ - Same External Reference                    │
     │ - Same Currency                              │
     │ - Exact Same Gross Amount                    │
     └──────────────────────┬───────────────────────┘
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
         [ MATCHED (1) ]            [ Unmatched ]
                                         │
                                         ▼
     ┌──────────────────────────────────────────────┐
     │ PASS 2: Fee Variance Match                   │
     │ - Same External Reference                    │
     │ - Internal Amount == (Net + Fee)             │
     │ - Or Amount Diff <= Max Fee Tolerance        │
     └──────────────────────┬───────────────────────┘
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
    [ MATCHED_WITH_FEE (2) ]        [ Unmatched ]
                                         │
                                         ▼
     ┌──────────────────────────────────────────────┐
     │ PASS 3: Amount Mismatch Discrepancy          │
     │ - Reference found in both systems            │
     │ - Discrepancy exceeds allowable tolerance    │
     └──────────────────────┬───────────────────────┘
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
     [ AMOUNT_MISMATCH (3) ]        [ Unmatched ]
     -> Auto-create Exception            │
                                         ▼
     ┌──────────────────────────────────────────────┐
     │ PASS 4 & 5: Missing / Duplicate Records      │
     │ - Internal exists, Provider absent -> (5)    │
     │ - Provider exists, Internal absent -> (4)    │
     │ - Duplicate Provider Trx / Ref     -> (6)    │
     └──────────────────────┬───────────────────────┘
                            │
                            ▼
                 Auto-create Exceptions
```

---

## 2. Match Status Taxonomy

| Status Code | Enum Name | Description | Action Required |
| :--- | :--- | :--- | :--- |
| **1** | `Matched` | Both systems agree on External Ref, Currency, and Gross Amount. | Auto-cleared |
| **2** | `MatchedWithFeeVariance` | Nominal differs by bank transaction fee within configured tolerance. | Auto-cleared with audit tag |
| **3** | `AmountMismatch` | Transaction exists in both systems, but nominal variance exceeds tolerance threshold. | Routed to Exception Queue (Severity: High) |
| **4** | `MissingInternal` | Provider settled transaction that cannot be found in internal ledger. | Routed to Exception Queue (Potential orphan funds) |
| **5** | `MissingProvider` | Internal system captured payment, but provider statement has no settlement record. | Routed to Exception Queue (Potential missing settlement) |
| **6** | `Duplicate` | Same external reference or provider transaction ID reported more than once. | Routed to Exception Queue (Duplicate payout prevention) |
