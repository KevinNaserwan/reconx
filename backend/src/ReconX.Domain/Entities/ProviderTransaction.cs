namespace ReconX.Domain.Entities;

public class ProviderTransaction
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ImportBatchId { get; set; } = string.Empty;
    public ImportBatch? ImportBatch { get; set; }
    public string ProviderId { get; set; } = string.Empty;
    public Provider? Provider { get; set; }
    public string ProviderTrxId { get; set; } = string.Empty;
    public string ExternalRef { get; set; } = string.Empty;
    public decimal GrossAmount { get; set; }
    public decimal FeeAmount { get; set; } = 0.0000m;
    public decimal NetAmount { get; set; }
    public string Currency { get; set; } = "IDR";
    public DateTime SettlementTime { get; set; }
    public string? RawPayloadJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ReconciliationResult> ReconciliationResults { get; set; } = new List<ReconciliationResult>();
}
