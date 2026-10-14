using ReconX.Domain.Enums;

namespace ReconX.Domain.Entities;

public class Provider
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public FeeCalculationType FeeCalculationType { get; set; } = FeeCalculationType.Percentage;
    public decimal FeeRate { get; set; } = 0.0000m;
    public decimal FixedFeeAmount { get; set; } = 0.0000m;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<InternalTransaction> InternalTransactions { get; set; } = new List<InternalTransaction>();
    public ICollection<ProviderTransaction> ProviderTransactions { get; set; } = new List<ProviderTransaction>();
    public ICollection<ImportBatch> ImportBatches { get; set; } = new List<ImportBatch>();
    public ICollection<ReconciliationRun> ReconciliationRuns { get; set; } = new List<ReconciliationRun>();
}
