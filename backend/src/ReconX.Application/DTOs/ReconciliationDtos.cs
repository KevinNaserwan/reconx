using ReconX.Domain.Enums;

namespace ReconX.Application.DTOs;

public record ReconciliationRunRequestDto(
    string ProviderId,
    DateTime CutoffStart,
    DateTime CutoffEnd,
    decimal FeeTolerancePercentage = 0.05m // Max 5% variance tolerance
);

public record ReconciliationSummaryDto(
    string RunId,
    string RunNumber,
    string ProviderCode,
    string ProviderName,
    DateTime CutoffStart,
    DateTime CutoffEnd,
    int TotalProcessed,
    int TotalMatched,
    int TotalDiscrepancy,
    decimal MatchPercentage,
    decimal TotalInternalAmount,
    decimal TotalProviderAmount,
    decimal TotalDiscrepancyAmount,
    string Status,
    DateTime StartedAt,
    DateTime? CompletedAt
);

public record ReconciliationResultItemDto(
    string ResultId,
    string? InternalTransactionId,
    string? InternalTransactionRef,
    string? ExternalRef,
    decimal? InternalAmount,
    string? ProviderTransactionId,
    string? ProviderTrxId,
    decimal? ProviderGrossAmount,
    decimal? ProviderNetAmount,
    decimal? ProviderFeeAmount,
    string Currency,
    MatchStatus MatchStatus,
    decimal AmountDifference,
    string? DiscrepancyReason,
    DateTime CreatedAt,
    string? ExceptionId,
    string? ExceptionStatus
);
