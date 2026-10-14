# ADR 0002: Fixed-Point Numeric Precision & Banker's Rounding

## Status
Accepted

## Context
Floating-point arithmetic (e.g. `float`, `double` in C# or `DOUBLE PRECISION` in SQL) suffers from binary representation artifacts (e.g. `0.1 + 0.2 = 0.30000000000000004`). In financial reconciliation, unrounded pennies lead to cumulative settlement variances.

## Decision
1. In PostgreSQL, all money columns are explicitly typed as `NUMERIC(18, 4)`.
2. In C# / .NET, all money values are represented as `decimal`.
3. Standard division and fee deduction employ **Banker's Rounding** (`MidpointRounding.ToEven`) to prevent statistical drift during large-scale aggregations.

## Consequences
- **Positive**: Exact decimal representation with zero loss of financial precision across millions of transactions.
- **Negative**: Slightly larger storage footprint (10 bytes per numeric) compared to 64-bit IEEE-754 floats.
