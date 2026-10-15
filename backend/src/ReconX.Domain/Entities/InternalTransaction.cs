namespace ReconX.Domain.Entities;

public class InternalTransaction
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TransactionRef { get; set; } = string.Empty;
    public string ExternalRef { get; set; } = string.Empty;
    public string ProviderId { get; set; } = string.Empty;
    public Provider? Provider { get; set; }
    public decimal Amount { get; set; }
    public decimal FeeAmount { get; set; } = 0.0000m;
    public string Currency { get; set; } = "IDR";
    public DateTime TransactionTime { get; set; }
    public string Channel { get; set; } = "VA"; // VA, QRIS, CC, DISBURSEMENT
    public string Type { get; set; } = "EXPENSE"; // EXPENSE (Uang Keluar / Debit) or INCOME (Uang Masuk / Credit)
    public string Status { get; set; } = "SUCCESS";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ReconciliationResult> ReconciliationResults { get; set; } = new List<ReconciliationResult>();
}
