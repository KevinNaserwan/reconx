namespace ReconX.Application.DTOs;

public record CreateInternalTransactionDto(
    string TransactionRef,
    string ExternalRef,
    string ProviderId,
    decimal Amount,
    decimal FeeAmount,
    string Currency,
    DateTime TransactionTime,
    string Channel
);

public record InternalTransactionResponseDto(
    string Id,
    string TransactionRef,
    string ExternalRef,
    string ProviderId,
    string ProviderName,
    decimal Amount,
    decimal FeeAmount,
    string Currency,
    DateTime TransactionTime,
    string Channel,
    string Status,
    DateTime CreatedAt
);
