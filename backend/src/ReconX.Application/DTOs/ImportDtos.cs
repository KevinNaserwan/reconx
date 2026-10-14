namespace ReconX.Application.DTOs;

public record ProviderCsvRow(
    string ProviderTrxId,
    string ExternalRef,
    decimal GrossAmount,
    decimal FeeAmount,
    decimal NetAmount,
    string Currency,
    DateTime SettlementTime
);

public record ImportBatchSummaryDto(
    string Id,
    string ProviderId,
    string ProviderCode,
    string ProviderName,
    string FileName,
    string FileSha256,
    int TotalRecords,
    int ProcessedRecords,
    int FailedRecords,
    string Status,
    string? ErrorSummary,
    string ImportedBy,
    DateTime CreatedAt
);
