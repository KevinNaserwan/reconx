namespace ReconX.Domain.Entities;

public class ImportBatch
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ProviderId { get; set; } = string.Empty;
    public Provider? Provider { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileSha256 { get; set; } = string.Empty;
    public int TotalRecords { get; set; }
    public int ProcessedRecords { get; set; }
    public int FailedRecords { get; set; }
    public string Status { get; set; } = "PENDING"; // PENDING, PROCESSING, COMPLETED, FAILED
    public string? ErrorSummary { get; set; }
    public string ImportedBy { get; set; } = "SYSTEM";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProviderTransaction> Transactions { get; set; } = new List<ProviderTransaction>();
}
