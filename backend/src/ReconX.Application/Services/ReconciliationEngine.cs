using Microsoft.EntityFrameworkCore;
using ReconX.Application.DTOs;
using ReconX.Application.Interfaces;
using ReconX.Domain.Entities;
using ReconX.Domain.Enums;
using ReconX.Domain.Exceptions;

namespace ReconX.Application.Services;

public class ReconciliationEngine : IReconciliationEngine
{
    private readonly IAppDbContext _context;

    public ReconciliationEngine(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ReconciliationSummaryDto> ExecuteRunAsync(
        ReconciliationRunRequestDto request, 
        string executedBy, 
        CancellationToken cancellationToken = default)
    {
        var provider = await _context.Providers
            .FirstOrDefaultAsync(p => p.Id == request.ProviderId, cancellationToken)
            ?? throw new DomainException($"Provider with ID '{request.ProviderId}' not found.");

        var runNumber = $"REC-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        
        var run = new ReconciliationRun
        {
            RunNumber = runNumber,
            ProviderId = provider.Id,
            CutoffStart = request.CutoffStart,
            CutoffEnd = request.CutoffEnd,
            Status = "RUNNING",
            ExecutedBy = executedBy,
            StartedAt = DateTime.UtcNow
        };

        _context.ReconciliationRuns.Add(run);
        await _context.SaveChangesAsync(cancellationToken);

        // Fetch Internal & Provider Transactions within cutoff window
        var internalTrxs = await _context.InternalTransactions
            .Where(t => t.ProviderId == provider.Id && 
                        t.TransactionTime >= request.CutoffStart && 
                        t.TransactionTime <= request.CutoffEnd)
            .ToListAsync(cancellationToken);

        var providerTrxs = await _context.ProviderTransactions
            .Where(t => t.ProviderId == provider.Id && 
                        t.SettlementTime >= request.CutoffStart && 
                        t.SettlementTime <= request.CutoffEnd)
            .ToListAsync(cancellationToken);

        var matchedInternalIds = new HashSet<string>();
        var matchedProviderIds = new HashSet<string>();
        var results = new List<ReconciliationResult>();
        var exceptions = new List<ExceptionCase>();

        // Group provider transactions by ExternalRef for efficient matching & duplicate detection
        var providerByRef = providerTrxs
            .Where(p => !string.IsNullOrWhiteSpace(p.ExternalRef))
            .GroupBy(p => p.ExternalRef.Trim())
            .ToDictionary(g => g.Key, g => g.ToList(), StringComparer.OrdinalIgnoreCase);

        // --- PASS 1 & 2 & 3: Iterate through Internal Transactions ---
        foreach (var internalTrx in internalTrxs)
        {
            var extRef = internalTrx.ExternalRef?.Trim() ?? string.Empty;

            if (!string.IsNullOrEmpty(extRef) && providerByRef.TryGetValue(extRef, out var matchingProviders))
            {
                var candidate = matchingProviders.FirstOrDefault(p => !matchedProviderIds.Contains(p.Id));
                if (candidate != null)
                {
                    matchedInternalIds.Add(internalTrx.Id);
                    matchedProviderIds.Add(candidate.Id);

                    decimal amountDiff = Math.Abs(internalTrx.Amount - candidate.GrossAmount);

                    if (amountDiff == 0m)
                    {
                        // Pass 1: Exact Match
                        results.Add(new ReconciliationResult
                        {
                            RunId = run.Id,
                            InternalTransactionId = internalTrx.Id,
                            ProviderTransactionId = candidate.Id,
                            MatchStatus = MatchStatus.Matched,
                            AmountDifference = 0m,
                            DiscrepancyReason = null
                        });
                    }
                    else
                    {
                        // Check if difference matches expected net + fee
                        decimal feeAdjustedDiff = Math.Abs(internalTrx.Amount - (candidate.NetAmount + candidate.FeeAmount));
                        decimal toleranceAmount = internalTrx.Amount * request.FeeTolerancePercentage;

                        if (feeAdjustedDiff == 0m || amountDiff <= toleranceAmount)
                        {
                            // Pass 2: Fee Variance Match
                            results.Add(new ReconciliationResult
                            {
                                RunId = run.Id,
                                InternalTransactionId = internalTrx.Id,
                                ProviderTransactionId = candidate.Id,
                                MatchStatus = MatchStatus.MatchedWithFeeVariance,
                                AmountDifference = amountDiff,
                                DiscrepancyReason = $"Nominal difference of {amountDiff:N2} resolved via provider fee tolerance ({candidate.FeeAmount:N2})."
                            });
                        }
                        else
                        {
                            // Pass 3: Amount Mismatch Discrepancy
                            var result = new ReconciliationResult
                            {
                                RunId = run.Id,
                                InternalTransactionId = internalTrx.Id,
                                ProviderTransactionId = candidate.Id,
                                MatchStatus = MatchStatus.AmountMismatch,
                                AmountDifference = amountDiff,
                                DiscrepancyReason = $"Amount discrepancy: Internal={internalTrx.Amount:N2}, Provider Gross={candidate.GrossAmount:N2}, Diff={amountDiff:N2}"
                            };
                            results.Add(result);

                            exceptions.Add(new ExceptionCase
                            {
                                ReconResult = result,
                                Severity = amountDiff > 1_000_000m ? ExceptionSeverity.Critical : ExceptionSeverity.High,
                                Status = ExceptionStatus.Open
                            });
                        }
                    }
                    continue;
                }
            }

            // Pass 5: Missing in Provider (Internal has it, provider does not)
            if (!matchedInternalIds.Contains(internalTrx.Id))
            {
                var result = new ReconciliationResult
                {
                    RunId = run.Id,
                    InternalTransactionId = internalTrx.Id,
                    ProviderTransactionId = null,
                    MatchStatus = MatchStatus.MissingProvider,
                    AmountDifference = internalTrx.Amount,
                    DiscrepancyReason = $"Transaction {internalTrx.TransactionRef} (Ref: {internalTrx.ExternalRef}) exists internally but missing in provider settlement statement."
                };
                results.Add(result);

                exceptions.Add(new ExceptionCase
                {
                    ReconResult = result,
                    Severity = ExceptionSeverity.Medium,
                    Status = ExceptionStatus.Open
                });
            }
        }

        // --- PASS 4: Handle Remaining / Unmatched Provider Transactions ---
        foreach (var providerTrx in providerTrxs)
        {
            if (matchedProviderIds.Contains(providerTrx.Id)) continue;

            // Check if duplicate
            bool isDuplicate = providerTrxs.Count(p => p.ExternalRef == providerTrx.ExternalRef) > 1 ||
                               providerTrxs.Count(p => p.ProviderTrxId == providerTrx.ProviderTrxId) > 1;

            var status = isDuplicate ? MatchStatus.Duplicate : MatchStatus.MissingInternal;
            var reason = isDuplicate
                ? $"Duplicate transaction detected with providerTrxId '{providerTrx.ProviderTrxId}' or ref '{providerTrx.ExternalRef}'."
                : $"Provider reported transaction '{providerTrx.ProviderTrxId}' with ref '{providerTrx.ExternalRef}' but no matching internal transaction found.";

            var result = new ReconciliationResult
            {
                RunId = run.Id,
                InternalTransactionId = null,
                ProviderTransactionId = providerTrx.Id,
                MatchStatus = status,
                AmountDifference = providerTrx.GrossAmount,
                DiscrepancyReason = reason
            };
            results.Add(result);

            exceptions.Add(new ExceptionCase
            {
                ReconResult = result,
                Severity = isDuplicate ? ExceptionSeverity.High : ExceptionSeverity.Medium,
                Status = ExceptionStatus.Open
            });
        }

        // --- Compute Summary Totals ---
        int totalMatched = results.Count(r => r.MatchStatus == MatchStatus.Matched || r.MatchStatus == MatchStatus.MatchedWithFeeVariance);
        int totalDiscrepancy = results.Count - totalMatched;
        decimal totalInternalAmount = internalTrxs.Sum(t => t.Amount);
        decimal totalProviderAmount = providerTrxs.Sum(p => p.GrossAmount);
        decimal totalDiscrepancyAmount = results
            .Where(r => r.MatchStatus != MatchStatus.Matched && r.MatchStatus != MatchStatus.MatchedWithFeeVariance)
            .Sum(r => r.AmountDifference);

        decimal matchRate = results.Count > 0 
            ? Math.Round((decimal)totalMatched / results.Count * 100m, 2, MidpointRounding.ToEven) 
            : 0m;

        run.TotalMatched = totalMatched;
        run.TotalDiscrepancy = totalDiscrepancy;
        run.TotalInternalAmount = totalInternalAmount;
        run.TotalProviderAmount = totalProviderAmount;
        run.Status = "COMPLETED";
        run.CompletedAt = DateTime.UtcNow;

        _context.ReconciliationResults.AddRange(results);
        _context.Exceptions.AddRange(exceptions);

        _context.AuditLogs.Add(new AuditLog
        {
            EntityName = "RECONCILIATION_RUN",
            EntityId = run.Id,
            Action = "EXECUTE_RECONCILIATION",
            ActorUsername = executedBy,
            NewState = $"{{\"runNumber\":\"{run.RunNumber}\",\"totalMatched\":{totalMatched},\"totalDiscrepancy\":{totalDiscrepancy},\"matchRate\":{matchRate}}}"
        });

        await _context.SaveChangesAsync(cancellationToken);

        return new ReconciliationSummaryDto(
            run.Id,
            run.RunNumber,
            provider.Code,
            provider.Name,
            run.CutoffStart,
            run.CutoffEnd,
            results.Count,
            totalMatched,
            totalDiscrepancy,
            matchRate,
            totalInternalAmount,
            totalProviderAmount,
            totalDiscrepancyAmount,
            run.Status,
            run.StartedAt,
            run.CompletedAt
        );
    }
}
