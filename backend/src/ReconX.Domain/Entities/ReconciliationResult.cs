using ReconX.Domain.Enums;

namespace ReconX.Domain.Entities;

public class ReconciliationResult
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string RunId { get; set; } = string.Empty;
    public ReconciliationRun? Run { get; set; }
    public string? InternalTransactionId { get; set; }
    public InternalTransaction? InternalTransaction { get; set; }
    public string? ProviderTransactionId { get; set; }
    public ProviderTransaction? ProviderTransaction { get; set; }
    public MatchStatus MatchStatus { get; set; }
    public decimal AmountDifference { get; set; } = 0.0000m;
    public string? DiscrepancyReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ExceptionCase? ExceptionCase { get; set; }
}
