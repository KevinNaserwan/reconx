using ReconX.Domain.Enums;

namespace ReconX.Domain.Entities;

public class ExceptionCase
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ReconResultId { get; set; } = string.Empty;
    public ReconciliationResult? ReconResult { get; set; }
    public string? AssignedTo { get; set; }
    public ExceptionSeverity Severity { get; set; } = ExceptionSeverity.Medium;
    public ExceptionStatus Status { get; set; } = ExceptionStatus.Open;
    public ResolutionType? ResolutionType { get; set; }
    public string? ResolutionNotes { get; set; }
    public string? ResolvedBy { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
