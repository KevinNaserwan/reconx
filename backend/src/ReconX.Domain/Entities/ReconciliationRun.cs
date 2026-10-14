namespace ReconX.Domain.Entities;

public class ReconciliationRun
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string RunNumber { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public Provider? Provider { get; set; }
    public DateTime CutoffStart { get; set; }
    public DateTime CutoffEnd { get; set; }
    public int TotalMatched { get; set; }
    public int TotalDiscrepancy { get; set; }
    public decimal TotalInternalAmount { get; set; }
    public decimal TotalProviderAmount { get; set; }
    public string Status { get; set; } = "RUNNING"; // RUNNING, COMPLETED, FAILED
    public string ExecutedBy { get; set; } = "SYSTEM";
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    public ICollection<ReconciliationResult> Results { get; set; } = new List<ReconciliationResult>();
}
