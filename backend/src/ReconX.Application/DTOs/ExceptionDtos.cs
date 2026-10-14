using ReconX.Domain.Enums;

namespace ReconX.Application.DTOs;

public record ExceptionCaseDto(
    string Id,
    string ReconResultId,
    string RunNumber,
    string? ExternalRef,
    string? InternalTransactionRef,
    string? ProviderTrxId,
    decimal AmountDifference,
    MatchStatus MatchStatus,
    string? DiscrepancyReason,
    string? AssignedTo,
    ExceptionSeverity Severity,
    ExceptionStatus Status,
    ResolutionType? ResolutionType,
    string? ResolutionNotes,
    string? ResolvedBy,
    DateTime? ResolvedAt,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record AssignExceptionRequestDto(
    string AssignedTo
);

public record ResolveExceptionRequestDto(
    ResolutionType ResolutionType,
    string ResolutionNotes,
    string ResolvedBy
);
